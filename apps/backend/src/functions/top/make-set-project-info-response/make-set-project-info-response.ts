import { Result } from '@praha/byethrow';
import { makeId } from '#common/functions/make-id/make-id';
import type { BackendCommonError } from '#common/types/backend/errors/backend-common-error';
import type { BackendInternalError } from '#common/types/backend/errors/backend-internal-error';
import type { ToBackendResponseMetadata } from '#common/types/backend/response/to-backend-response-metadata';
import type { ToBackendSetProjectInfoError } from '#common/types/backend/routes/projects/set-project-info/set-project-info-error';
import type { ToBackendSetProjectInfoOutput } from '#common/types/backend/routes/projects/set-project-info/set-project-info-output';
import type { ToBackendSetProjectInfoResponse } from '#common/types/backend/routes/projects/set-project-info/set-project-info-response';

export function makeSetProjectInfoResponse(item: {
  result: Result.Result<
    ToBackendSetProjectInfoOutput,
    ToBackendSetProjectInfoError | BackendCommonError | BackendInternalError
  >;
  traceId?: string;
  method: string;
  mproveVersion?: string;
  duration: number;
}): ToBackendSetProjectInfoResponse {
  let { result, traceId, method, mproveVersion, duration } = item;

  let metadata: ToBackendResponseMetadata<'setProjectInfo'> = {
    operation: 'setProjectInfo',
    method: method,
    mproveVersion: mproveVersion ?? '',
    duration: Number.isFinite(duration) ? Math.max(0, duration) : 0,
    traceId: typeof traceId === 'string' ? traceId : makeId()
  };

  let response: ToBackendSetProjectInfoResponse = Result.isFailure(result)
    ? { type: 'Failure', ...metadata, error: result.error }
    : { type: 'Success', ...metadata, output: result.value };

  return response;
}
