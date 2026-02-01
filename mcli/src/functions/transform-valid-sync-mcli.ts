import {
  ClassType,
  TransformValidationOptions,
  transformAndValidateSync
} from 'class-transformer-validator';
import { ServerError } from '#common/models/server-error';
import { getConstraintsRecursive } from '#node-common/functions/get-constraints-recursive';

export function transformValidSyncMcli<T extends object>(item: {
  classType: ClassType<T>;
  object: object;
  options?: TransformValidationOptions;
  errorMessage: any;
}) {
  let { classType, object, options, errorMessage } = item;

  let valid: T;
  try {
    valid = transformAndValidateSync(classType, object, options);
  } catch (e) {
    let constraints;

    if (Array.isArray(e)) {
      constraints = getConstraintsRecursive(e);
    }

    let serverError = new ServerError({
      message: errorMessage,
      displayData: constraints
    });

    throw serverError;
  }
  return valid;
}
