import { enums } from '~api/barrels/enums';
import { ServerError } from '~api/models/server-error';

export function wrapError(e: any) {
  let wrappedError = {
    story:
      e instanceof ServerError
        ? enums.ErrorStoryEnum.DefinedError
        : enums.ErrorStoryEnum.UnknownError,
    name: e.name || null,
    message: e.message || null,
    at: e.stack?.split('\n')[1] || null,
    data: e.data || null,
    stackArray: e.stack?.split('\n') || null,
    originalError: e.originalError || null,
    originalErrorStack: e.originalError?.stack || null,
    e: e instanceof ServerError ? null : e
  };

  return wrappedError;
}
