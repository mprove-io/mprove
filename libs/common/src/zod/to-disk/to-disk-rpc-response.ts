import type { ToDiskInvalidRequestErrorResponse } from '#common/zod/to-disk/to-disk-invalid-request-error-response';
import type { ToDiskOperationResponse } from '#common/zod/to-disk/to-disk-operation-response';

export type ToDiskRpcResponse =
  | ToDiskOperationResponse
  | ToDiskInvalidRequestErrorResponse;
