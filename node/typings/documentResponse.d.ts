import type { MasterDataEntity } from './masterDataEntity'
import type { OperationResult } from './operationResult'

export interface DocumentResponse extends MasterDataEntity {
  result: OperationResult
  statusCode: number
}
