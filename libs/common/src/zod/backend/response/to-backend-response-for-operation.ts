import type { ToBackendOperation } from '#common/zod/backend/request/to-backend-operation';
import type { ToBackendOperationRegistry } from '#common/zod/backend/request/to-backend-operation-registry';

export type ToBackendResponseForOperation<
  TOperation extends ToBackendOperation
> = ToBackendOperationRegistry[TOperation]['response'];
