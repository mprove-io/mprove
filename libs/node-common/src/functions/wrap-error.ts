import { ErrorStoryEnum } from '#common/enums/error-story.enum';
import { ServerError } from '#common/models/server-error';

export interface WrappedError {
  story: ErrorStoryEnum;
  name: any;
  message: any;
  at: any;
  displayData: any;
  customData: any;
  stackArray: any;
  originalError: any;
  originalErrorStack: any;
  e: any;
}

function splitMultilineMessage(value: any) {
  if (typeof value !== 'string') {
    return value || null;
  }
  return value.includes('\n') ? value.split('\n') : value;
}

export function wrapError(e: any) {
  let originalError = e.originalError || null;

  let normalizedOriginalError =
    originalError &&
    typeof originalError === 'object' &&
    typeof originalError.message === 'string' &&
    originalError.message.includes('\n')
      ? {
          ...originalError,
          message: splitMultilineMessage(originalError.message)
        }
      : originalError;

  let wrappedError: WrappedError = {
    story:
      e instanceof ServerError
        ? ErrorStoryEnum.DefinedError
        : ErrorStoryEnum.UnknownError,
    name: e.name || null,
    message: splitMultilineMessage(e.message),
    at: e.stack?.split('\n')[1] || null,
    displayData: e.displayData || null,
    customData: e.customData || null,
    stackArray: e.stack?.split('\n') || null,
    originalError: normalizedOriginalError,
    originalErrorStack: e.originalError?.stack?.split('\n') || null,
    e: e instanceof ServerError ? null : e
  };

  return wrappedError;
}
