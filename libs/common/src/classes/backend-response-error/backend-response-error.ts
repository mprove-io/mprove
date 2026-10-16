import { ServerError } from '#common/classes/server-error/server-error';
import type { BackendError } from '#common/types/backend/errors/backend-error';
import type { ToBackendResponseBase } from '#common/types/backend/response/to-backend-response-base';

export class BackendResponseError extends ServerError {
  readonly response: Extract<
    ToBackendResponseBase<string, unknown, BackendError>,
    { type: 'Failure' }
  >;

  constructor(item: {
    response: Extract<
      ToBackendResponseBase<string, unknown, BackendError>,
      { type: 'Failure' }
    >;
  }) {
    let { response } = item;

    super({
      message: response.error.code,
      displayData:
        'displayData' in response.error
          ? response.error.displayData
          : undefined,
      originalError:
        'originalError' in response.error
          ? response.error.originalError
          : undefined
    });

    this.name = 'BackendResponseError';
    this.response = response;
  }
}
