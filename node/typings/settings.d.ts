interface Settings {
  updateableClientFields: string[]
  entityConfigurations: EntityConfiguration[]
}

interface EntityConfiguration {
  entityAcronym: string
  fieldToMatchOnEntity: string
  fieldToMatchOnClient: string
  canCreate: boolean
  canDelete: boolean
  updateableFields: string[]
}
