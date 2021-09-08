/* eslint-disable @typescript-eslint/ban-types */
import {
  ClassType,
  transformAndValidateSync,
  TransformValidationOptions
} from 'class-transformer-validator';
import { ServerError } from '~common/models/server-error';

export function transformValidSync<T extends object>(item: {
  classType: ClassType<T>;
  object: object;
  options?: TransformValidationOptions;
  errorMessage: any;
}) {
  let valid: T;
  try {
    valid = transformAndValidateSync(item.classType, item.object, item.options);
  } catch (e) {
    if (Array.isArray(e)) {
      let newValidationErrors: any = [];

      e.forEach(validationError => {
        let validationErrorWithoutTarget = {
          value: validationError.value,
          property: validationError.property,
          children: validationError.children,
          constraints: validationError.constraints
        };
        newValidationErrors.push(validationErrorWithoutTarget);
      });

      console.log(newValidationErrors);
    }

    throw new ServerError({
      message: item.errorMessage,
      data: null,
      originalError: null
    });
  }
  return valid;
}
