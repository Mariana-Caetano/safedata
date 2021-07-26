interface PatchDocumentArgs {
  entity: string
  document: { document: { fields: Array<{ key: string; value: string }> } }
  schema?: string
}
