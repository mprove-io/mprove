import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { type Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import type { BackendConfig } from '#backend/config/backend-config';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { makeId } from '#common/functions/make-id/make-id';
import type { BackendInternalError } from '#common/types/backend/errors/backend-internal-error';
import type { ToBackendOperation } from '#common/types/backend/request/to-backend-operation';
import type { ToBackendResponseBase } from '#common/types/backend/response/to-backend-response-base';
import type { ToBackendResponseForOperation } from '#common/types/backend/response/to-backend-response-for-operation';
import type { ToBackendResponseMetadata } from '#common/types/backend/response/to-backend-response-metadata';
import {
  type WrappedError,
  wrapError
} from '#node-common/functions/wrap-error/wrap-error';

type BackendResultResponse<TOperation extends ToBackendOperation> =
  ToBackendResponseBase<
    TOperation,
    Extract<
      ToBackendResponseForOperation<TOperation>,
      { type: 'Success' }
    >['output'],
    Extract<
      ToBackendResponseForOperation<TOperation>,
      { type: 'Failure' }
    >['error']
  >;

// Only explicitly migrated operations may use this transport boundary.
export function makeBackendResultResponse<
  TOperation extends ToBackendOperation
>(item: {
  operation: TOperation;
  execution: Observable<BackendResultForOperation<TOperation>>;
  traceId?: string;
  method: string;
  cs: ConfigService<BackendConfig>;
  startTs: number;
  onUnexpectedError: (error: WrappedError) => void;
}): Observable<BackendResultResponse<TOperation>> {
  let {
    operation,
    execution,
    traceId,
    method,
    cs,
    startTs,
    onUnexpectedError
  } = item;

  let responseExecution: Observable<BackendResultResponse<TOperation>> =
    execution.pipe(
      catchError((e: unknown) => {
        let wrappedError: WrappedError = wrapError(e);

        onUnexpectedError(wrappedError);

        let failure: Result.Result<never, BackendInternalError> = Result.fail({
          code: 'BACKEND_INTERNAL'
        });

        let failureExecution: Observable<
          Result.Result<never, BackendInternalError>
        > = of(failure);

        return failureExecution;
      }),
      map(result => {
        let duration: number = Date.now() - startTs;

        let mproveVersion: string =
          cs.get<BackendConfig['mproveReleaseTag']>('mproveReleaseTag');

        let metadata: ToBackendResponseMetadata<TOperation> = {
          operation: operation,
          method: method,
          mproveVersion: mproveVersion ?? '',
          duration: Number.isFinite(duration) ? Math.max(0, duration) : 0,
          traceId: typeof traceId === 'string' ? traceId : makeId()
        };

        let response: BackendResultResponse<TOperation> = Result.isFailure(
          result
        )
          ? { type: 'Failure', ...metadata, error: result.error }
          : { type: 'Success', ...metadata, output: result.value };

        return response;
      })
    );

  return responseExecution;
}
