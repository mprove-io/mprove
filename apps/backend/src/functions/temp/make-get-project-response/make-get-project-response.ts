import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { type Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import type { BackendConfig } from '#backend/config/backend-config';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { makeId } from '#common/functions/make-id/make-id';
import type { BackendInternalError } from '#common/types/backend/errors/backend-internal-error';
import type { ToBackendResponseMetadata } from '#common/types/backend/response/to-backend-response-metadata';
import type { ToBackendGetProjectResponse } from '#common/types/backend/routes/projects/get-project/get-project-response';
import {
  type WrappedError,
  wrapError
} from '#node-common/functions/wrap-error/wrap-error';

// Temporary operation-specific transport boundary during incremental migration.
export function makeGetProjectResponse(item: {
  execution: Observable<BackendResultForOperation<'getProject'>>;
  traceId?: string;
  method: string;
  cs: ConfigService<BackendConfig>;
  startTs: number;
  onUnexpectedError: (error: WrappedError) => void;
}): Observable<ToBackendGetProjectResponse> {
  let { execution, traceId, method, cs, startTs, onUnexpectedError } = item;

  let responseExecution: Observable<ToBackendGetProjectResponse> =
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

        let metadata: ToBackendResponseMetadata<'getProject'> = {
          operation: 'getProject',
          method: method,
          mproveVersion: mproveVersion ?? '',
          duration: Number.isFinite(duration) ? Math.max(0, duration) : 0,
          traceId: typeof traceId === 'string' ? traceId : makeId()
        };

        let response: ToBackendGetProjectResponse = Result.isFailure(result)
          ? { type: 'Failure', ...metadata, error: result.error }
          : { type: 'Success', ...metadata, output: result.value };

        return response;
      })
    );

  return responseExecution;
}
