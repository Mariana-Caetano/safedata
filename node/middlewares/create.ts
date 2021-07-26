import camelCase from 'camelcase'
import transformObjKeys from 'transform-obj-keys'

import { setContextResult } from '../utils/setContextResult'

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
      setContextResult({
        ctx,
        statusCode: 401,
        logInfo: {
          needsLogging: true,
          logResult: 'unauthorized',
          logReason: `can't create this entity without authentication: ${dataEntity}`,
        },
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

  const documentResult = await createOrUpdateDocument(ctx, dataEntity, document)

  // transforms documentResult to camelCase since the MasterData API returns all data in PascalCase
  ctx.body = transformObjKeys({ ...document, ...documentResult }, camelCase)

  setContextResult({
    ctx,
    statusCode: 200,
    logInfo: {
      needsLogging: false,
    },
  })

  await next()
}

async function createOrUpdateDocument(
  ctx: Context,
  dataEntity: string,
  document: MasterDataEntity
) {
  try {
    return await ctx.clients.masterdata.createOrUpdatePartialDocument({
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

    return null
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
    setContextResult({
      ctx,
      statusCode: 403,
      logInfo: {
        needsLogging: true,
        logResult: 'forbidden',
        logReason: `orderForm email information (${orderForm.clientProfileData?.email}) does not match provided email (${document.email})`,
      },
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
    setContextResult({
      ctx,
      statusCode: 403,
      logInfo: {
        needsLogging: true,
        logResult: 'forbidden',
        logReason: `document to be created has invalid matching field ${
          entitySettings?.fieldToMatchOnEntity
        } - value ${
          document[entitySettings?.fieldToMatchOnEntity]
        } already belongs to a user`,
      },
    })

    return true
  }

  return false
}
