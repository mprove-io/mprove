/* eslint-disable @typescript-eslint/ban-types */
import {
  ClassType,
  transformAndValidateSync,
  TransformValidationOptions
} from 'class-transformer-validator';
import { ServerError } from '~common/models/server-error';
import { nodeCommon } from '~mcli/barrels/node-common';

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
      constraints = nodeCommon.getConstraintsRecursive(e);
    }

    let serverError = new ServerError({
      message: errorMessage,
      data: constraints,
      originalError: null
    });

    throw serverError;
  }
  return valid;
}
