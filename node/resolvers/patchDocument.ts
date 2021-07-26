import type { ServiceContext } from '@vtex/api'

import type { Clients } from '../clients'
import { create } from '../middlewares/create'
import { getAuthInfo } from '../middlewares/getAuthInfo'
import { getClient } from '../middlewares/getClient'
import { getOperation } from '../middlewares/getOperation'
import { getSettings } from '../middlewares/getSettings'
import { validateDocumentOwnership } from '../middlewares/validateDocumentOwnership'
import { validateLogin } from '../middlewares/validateLogin'
import type { DocumentResponse } from '../typings/documentResponse'

export async function patchDocument(
  _: unknown,
  args: PatchDocumentArgs,
  context: ServiceContext<Clients>
): Promise<DocumentResponse> {
  let follow = false

  const document: { [key: string]: unknown } = {}

  // this type is 'weird' on purpose to match the same graphql mutation used in vtex.order-form
  for (const kvp of args.document.document.fields) {
    document[kvp.key] = kvp.value
  }

  // casting the graphql context to a format which can be understood by REST middlewares
  const graphqlContext = ({
    ...context,
    query: {},
    state: { document },
    method: 'PATCH',
    vtex: {
      ...context.vtex,
      route: { id: 'documents', params: { entity: args.entity } },
    },
  } as unknown) as Context

  // this method allows short-circuiting the middlewares when necessary
  const followNext = () => Promise.resolve((follow = true))

  // I'm reusing the service middlewares so there's no need to reimplement anything
  const callMiddleware = async (
    fn: (ctx: Context, next: () => Promise<unknown>) => Promise<void>
  ) => {
    await fn(graphqlContext, followNext)

    return follow === true
  }

  const middlewares = [
    getAuthInfo,
    getOperation,
    getSettings,
    getClient,
    validateLogin,
    validateDocumentOwnership,
    create,
  ]

  for (const fn of middlewares) {
    // I'm disabling this rule here since we must await the middlewares in order
    // eslint-disable-next-line no-await-in-loop
    if (await callMiddleware(fn)) {
      follow = false
      continue
    }

    return {
      result: graphqlContext.state.result,
      statusCode: graphqlContext.status,
    }
  }

  return {
    ...(graphqlContext.body as MasterDataEntity),
    result: 'ok',
    statusCode: graphqlContext.status,
  }
}
