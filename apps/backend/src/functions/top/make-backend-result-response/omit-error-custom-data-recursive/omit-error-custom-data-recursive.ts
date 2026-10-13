import { isDefined } from '#common/functions/is-defined/is-defined';

type ErrorWithCustomData = {
  code: string;
  customData?: unknown;
  originalError?: ErrorWithCustomData;
};

// Copy only the error chain; retain public details without mutating diagnostics.
export function omitErrorCustomDataRecursive<
  TError extends ErrorWithCustomData
>(item: { error: TError }): TError {
  let { error } = item;

  let publicError: TError = { ...error };

  delete publicError.customData;

  if (isDefined(error.originalError)) {
    publicError.originalError = omitErrorCustomDataRecursive({
      error: error.originalError
    });
  }

  return publicError;
}
