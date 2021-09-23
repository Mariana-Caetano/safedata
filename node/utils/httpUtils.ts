const SUCCESS_STATUS_CODE_RANGE = 200
const REDIRECT_STATUS_CODE_RANGE = 300

export const StatusCodes = {
  OK: 200,
  NOT_MODIFIED: 304,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}

export const isSuccessfulStatusCode = (statusCode: number) =>
  statusCode >= SUCCESS_STATUS_CODE_RANGE &&
  statusCode < REDIRECT_STATUS_CODE_RANGE
