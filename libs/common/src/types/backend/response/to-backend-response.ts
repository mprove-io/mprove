import type { ToBackendOperation } from '#common/types/backend/request/to-backend-operation';
import type { ToBackendResponseForOperation } from './to-backend-response-for-operation';
import type { ToBackendUnknownOperationResponse } from './to-backend-unknown-operation-response';

export type ToBackendResponse =
  | ToBackendResponseForOperation<ToBackendOperation>
  | ToBackendUnknownOperationResponse;
