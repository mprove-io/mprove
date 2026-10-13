import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { Observable } from 'rxjs';
import { filter, map, materialize } from 'rxjs/operators';
import type { BackendConfig } from '#backend/config/backend-config';
import { omitErrorCustomDataRecursive } from '#backend/functions/temp/make-backend-result-response/omit-error-custom-data-recursive/omit-error-custom-data-recursive';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { ServerError } from '#common/classes/server-error/server-error';
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

export type MakeBackendResultResponseOutput<
  TOperation extends ToBackendOperation
> = {
  response: BackendResultResponse<TOperation>;
  wrappedError?: WrappedError;
};

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
}): Observable<MakeBackendResultResponseOutput<TOperation>> {
  let { operation, execution, traceId, method, cs, startTs } = item;

  let responseExecution: Observable<
    MakeBackendResultResponseOutput<TOperation>
  > = execution.pipe(
    // Keep exceptions and Result failures in the same emission-local flow.
    materialize(),
    filter(notification => notification.kind !== 'C'),
    map(notification => {
      let result:
        | BackendResultForOperation<TOperation>
        | Result.Failure<BackendInternalError> =
        notification.kind === 'E'
          ? Result.fail({ code: 'BACKEND_INTERNAL' })
          : notification.value;

      let wrappedError: WrappedError =
        notification.kind === 'E' ? wrapError(notification.error) : undefined;

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

      if (Result.isFailure(result)) {
        // Expected failures carry diagnostics; unexpected throws already have them.
        if ('customData' in result.error || 'originalError' in result.error) {
          wrappedError = wrapError(
            new ServerError({
              message: result.error.code,
              displayData:
                'displayData' in result.error
                  ? result.error.displayData
                  : undefined,
              customData:
                'customData' in result.error
                  ? result.error.customData
                  : undefined,
              originalError:
                'originalError' in result.error
                  ? result.error.originalError
                  : undefined
            })
          );
        }

        let publicError: typeof result.error = omitErrorCustomDataRecursive({
          error: result.error
        });

        let response: BackendResultResponse<TOperation> = {
          type: 'Failure',
          ...metadata,
          error: publicError
        };

        let responseOutput: MakeBackendResultResponseOutput<TOperation> = {
          response: response,
          wrappedError: wrappedError
        };

        return responseOutput;
      }

      let response: BackendResultResponse<TOperation> = {
        type: 'Success',
        ...metadata,
        output: result.value
      };

      let responseOutput: MakeBackendResultResponseOutput<TOperation> = {
        response: response
      };

      return responseOutput;
    })
  );

  return responseExecution;
}
