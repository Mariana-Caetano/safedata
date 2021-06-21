import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import UserCache, { DEFAULT_USER_CACHE_MAX_AGE_IN_MS } from '../utils/userCache'

export default class VtexId extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('http://vtexid.vtex.com.br/api/', context, options)
  }

  public async getAuthenticatedUser(
    authToken: string
  ): Promise<AuthenticatedUser> {
    return UserCache.getOrSet(authToken, () =>
      this.http
        .get('vtexid/pub/authenticated/user/', {
          params: { authToken },
          metric: 'authenticated-user-get',
        })
        .then((res) => {
          return {
            value: res,
            maxAge: DEFAULT_USER_CACHE_MAX_AGE_IN_MS,
          }
        })
    ) as Promise<AuthenticatedUser>
  }
}
