import { BackendResponseError } from '#common/classes/backend-response-error/backend-response-error';
import type { ErrorData } from '#common/types/front/ui/error-data';

export class ApiRequestError extends Error {
  readonly errorData: ErrorData;

  readonly backendError?: BackendResponseError;

  constructor(item: { errorData: ErrorData }) {
    let { errorData } = item;

    super(errorData.message);

    this.name = 'ApiRequestError';
    this.errorData = errorData;

    if (errorData.originalError instanceof BackendResponseError) {
      this.backendError = errorData.originalError;
    }
  }
}
