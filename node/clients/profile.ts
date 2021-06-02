import { JanusClient } from '@vtex/api'

export default class Profile extends JanusClient {
  public async getPublicProfile(email: string): Promise<PublicProfile> {
    return this.http.get('api/checkout/pub/profiles', {
      params: { email },
      metric: 'checkout-public-profile-get',
    })
  }
}
