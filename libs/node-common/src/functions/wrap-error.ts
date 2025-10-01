import { ErrorStoryEnum } from '~common/enums/error-story.enum';
import { ServerError } from '~common/models/server-error';

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
  let wrappedError: WrappedError = {
    story:
      e instanceof ServerError
        ? ErrorStoryEnum.DefinedError
        : ErrorStoryEnum.UnknownError,
    name: e.name || null,
    message: e.message || null,
    at: e.stack?.split('\n')[1] || null,
    displayData: e.displayData || null,
    customData: e.customData || null,
    stackArray: e.stack?.split('\n') || null,
    originalError: e.originalError || null,
    originalErrorStack: e.originalError?.stack?.split('\n') || null,
    e: e instanceof ServerError ? null : e
  };

  return wrappedError;
}
