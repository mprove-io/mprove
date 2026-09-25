import { ServerError } from '#common/classes/server-error';
import { ErrorStoryEnum } from '#common/enums/error-story.enum';
import { splitMultilineMessage } from '#node-common/functions/wrap-error/split-multiline-message/split-multiline-message';

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

export function wrapError(e: any) {
  let originalError = e.originalError || null;

  let normalizedOriginalError =
    originalError &&
    typeof originalError === 'object' &&
    typeof originalError.message === 'string' &&
    originalError.message.includes('\n')
      ? {
          ...originalError,
          message: splitMultilineMessage({ value: originalError.message })
        }
      : originalError;

  let wrappedError: WrappedError = {
    story:
      e instanceof ServerError
        ? ErrorStoryEnum.DefinedError
        : ErrorStoryEnum.UnknownError,
    name: e.name || null,
    message: splitMultilineMessage({ value: e.message }),
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
