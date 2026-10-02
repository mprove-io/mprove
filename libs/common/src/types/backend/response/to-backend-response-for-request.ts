import type { ToBackendRequest } from '#common/types/backend/request/to-backend-request';
import type { ToBackendResponseForOperation } from './to-backend-response-for-operation';

export type ToBackendResponseForRequest<TRequest extends ToBackendRequest> =
  ToBackendResponseForOperation<TRequest['operation']>;
