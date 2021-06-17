import logResult from '../utils/log'
import { incrementRequestCounter } from '../utils/requestCounters'

export async function create(ctx: Context, next: () => Promise<unknown>) {
  const {
    state: { entity: dataEntity, entitySettings, isLoggedIn, document },
    query: { _orderFormId },
  } = ctx

  if (!isLoggedIn) {
    if (entitySettings.canCreate) {
      if (_orderFormId && document.email) {
        if (
          await hasInvalidOrderFormData({
            ctx,
            _orderFormId,
            dataEntity,
            entitySettings,
            document,
          })
        ) {
          return
        }
      } else if (
        await hasInvalidMatchingDocument({
          ctx,
          dataEntity,
          entitySettings,
          document,
        })
      ) {
        return
      }
    } else {
      ctx.status = 401
      logResult({
        ctx,
        result: 'unauthorized',
        reason: `can't create this entity without authentication: ${dataEntity}`,
      })

      incrementRequestCounter({
        operation: ctx.state.operation,
        route: ctx.vtex.route.id,
        entity: dataEntity,
        account: ctx.vtex.account,
        statusCode: ctx.status,
      })

      return
    }
  } else if (
    await hasInvalidMatchingDocument({
      ctx,
      dataEntity,
      entitySettings,
      document,
    })
  ) {
    return
  }

  await createOrUpdateDocument(ctx, dataEntity, document)

  ctx.body = document
  ctx.status = 200

  incrementRequestCounter({
    operation: ctx.state.operation,
    route: ctx.vtex.route.id,
    entity: dataEntity,
    account: ctx.vtex.account,
    statusCode: ctx.status,
  })

  await next()
}

async function createOrUpdateDocument(
  ctx: Context,
  dataEntity: string,
  document: MasterDataEntity
) {
  try {
    await ctx.clients.masterdata.createOrUpdatePartialDocument({
      dataEntity,
      fields: document,
      schema: ctx.query._schema,
    })
  } catch (error) {
    // masterdata returns 304 when the document already exists and is not modified as a result of the operation
    if (error.response.status !== 304) {
      ctx.vtex.logger.error(error)
      throw error
    }
  }
}

async function hasInvalidOrderFormData({
  ctx,
  _orderFormId,
  dataEntity,
  entitySettings,
  document,
}: {
  ctx: Context
  _orderFormId: string
  dataEntity: string
  entitySettings: EntityConfiguration
  document: MasterDataEntity
}) {
  const [orderForm, publicProfile] = await Promise.all([
    ctx.clients.checkout.orderForm(_orderFormId),
    ctx.clients.checkoutProfile.getPublicProfile(document.email),
  ])

  // if the profile is not yet saved, follow default matching rules
  if (!orderForm.clientProfileData?.email) {
    return hasInvalidMatchingDocument({
      ctx,
      dataEntity,
      entitySettings,
      document,
    })
  }

  // completed profiles cannot be changed when not logged in
  // the e-mails must match to allow the user to update the record
  if (
    publicProfile.isComplete ||
    orderForm.clientProfileData?.email !== document.email
  ) {
    ctx.status = 403
    logResult({
      ctx,
      result: 'forbidden',
      reason: `orderForm email information (${orderForm.clientProfileData?.email}) does not match provided email (${document.email})`,
    })

    incrementRequestCounter({
      operation: ctx.state.operation,
      route: ctx.vtex.route.id,
      entity: dataEntity,
      account: ctx.vtex.account,
      statusCode: ctx.status,
    })

    return true
  }

  return false
}

async function hasInvalidMatchingDocument({
  ctx,
  dataEntity,
  entitySettings,
  document,
}: {
  ctx: Context
  dataEntity: string
  entitySettings: EntityConfiguration
  document: MasterDataEntity
}) {
  const matchingDocuments = await ctx.clients.masterdata.searchDocuments<MasterDataEntity>(
    {
      dataEntity,
      fields: [entitySettings?.fieldToMatchOnEntity],
      where: `${entitySettings?.fieldToMatchOnEntity}=${
        document[entitySettings?.fieldToMatchOnEntity]
      }`,
      pagination: {
        page: 1,
        pageSize: 1,
      },
    }
  )

  if (matchingDocuments.length > 0) {
    ctx.status = 403
    logResult({
      ctx,
      result: 'forbidden',
      reason: `document to be created has invalid matching field ${
        entitySettings?.fieldToMatchOnEntity
      } - value ${
        document[entitySettings?.fieldToMatchOnEntity]
      } already belongs to a user`,
    })

    incrementRequestCounter({
      operation: ctx.state.operation,
      route: ctx.vtex.route.id,
      entity: dataEntity,
      account: ctx.vtex.account,
      statusCode: ctx.status,
    })

    return true
  }

  return false
}
