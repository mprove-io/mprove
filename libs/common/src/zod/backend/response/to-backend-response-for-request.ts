import type { ToBackendRequest } from '#common/zod/backend/request/to-backend-request';
import type { ToBackendResponseForOperation } from './to-backend-response-for-operation';

export type ToBackendResponseForRequest<TRequest extends ToBackendRequest> =
  ToBackendResponseForOperation<TRequest['operation']>;
