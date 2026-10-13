import { isDefined } from '#common/functions/is-defined/is-defined';

type ErrorWithCustomData = {
  code: string;
  customData?: unknown;
  originalError?: ErrorWithCustomData;
};

// Copy only the error chain; keep public details and internal diagnostics intact.
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
