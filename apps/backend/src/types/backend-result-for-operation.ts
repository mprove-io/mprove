import type { Result } from '@praha/byethrow';
import type { ToBackendOperation } from '#common/types/backend/request/to-backend-operation';
import type { ToBackendResponseForOperation } from '#common/types/backend/response/to-backend-response-for-operation';

export type BackendResultForOperation<TOperation extends ToBackendOperation> =
  Result.Result<
    Extract<
      ToBackendResponseForOperation<TOperation>,
      { type: 'Success' }
    >['output'],
    Extract<
      ToBackendResponseForOperation<TOperation>,
      { type: 'Failure' }
    >['error']
  >;
