import { ServerError } from '#common/models/server-error';

export function toServerError(item: {
  message: string;
  displayData?: unknown;
  customData?: unknown;
  originalError?: unknown;
  cause?: unknown;
}): ServerError {
  return new ServerError({
    message: item.message,
    displayData: item.displayData,
    customData: item.customData,
    originalError: item.originalError ?? item.cause
  });
}
