import type { ToBackendOperation } from '#common/types/backend/request/to-backend-operation';
import type { ToBackendOperationRegistry } from '#common/types/backend/request/to-backend-operation-registry';

export type ToBackendRequestForOperation<
  TOperation extends ToBackendOperation
> = ToBackendOperationRegistry[TOperation]['request'];
