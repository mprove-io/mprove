import { ServerError } from '#common/models/server-error';

export function toServerError(item: {
  code: string;
  displayData?: unknown;
  customData?: unknown;
  originalError?: unknown;
}): ServerError {
  let error: ServerError = new ServerError({
    message: item.code,
    displayData: item.displayData,
    customData: item.customData,
    originalError: item.originalError
  });

  return error;
}
