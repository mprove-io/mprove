/* eslint-disable @typescript-eslint/ban-types */
import {
  ClassType,
  TransformValidationOptions,
  transformAndValidateSync
} from 'class-transformer-validator';
import { common } from '~mcli/barrels/common';
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

    let serverError = new common.ServerError({
      message: errorMessage,
      data: constraints,
      originalError: null
    });

    throw serverError;
  }
  return valid;
}
