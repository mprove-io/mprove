import type { BackendError } from '#common/types/backend/errors/backend-error';
import type { ToBlockmlResponse } from '#common/types/blockml/response/to-blockml-response';
import type { ToDiskResponse } from '#common/types/disk/response/to-disk-response';
import type { Er } from '#common/types/shared/errors/er';

type ServerErrorMessage =
  | Er
  | BackendError['code']
  | Extract<ToBlockmlResponse, { type: 'Failure' }>['error']['code']
  | Extract<ToDiskResponse, { type: 'Failure' }>['error']['code'];

export class ServerError extends Error {
  message: ServerErrorMessage;

  displayData?: any;

  customData?: any;

  originalError?: any;

  constructor(item: {
    message: ServerErrorMessage;
    displayData?: any;
    customData?: any;
    originalError?: any;
  }) {
    super();

    this.message = item.message;
    this.displayData = item.displayData;
    this.customData = item.customData;
    this.originalError = item.originalError;
  }
}
