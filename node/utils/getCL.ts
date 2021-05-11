import type { MasterData } from '@vtex/api'

export default async function getCL(
  email: string | undefined,
  masterdata: MasterData,
  fields: string[]
) {
  if (!email) return undefined
  const document = await masterdata.searchDocuments<MasterDataEntity>({
    dataEntity: 'CL',
    where: `email=${email}`,
    fields,
    pagination: {
      page: 1,
      pageSize: 1,
    },
  })

  return document[0]
}
