export function parseFields(fields: string): string[] {
  if (!fields) return []

  return fields.split(',')
}
