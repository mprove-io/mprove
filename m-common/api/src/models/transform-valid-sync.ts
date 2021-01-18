/* eslint-disable @typescript-eslint/ban-types */
import {
  ClassType,
  transformAndValidateSync,
  TransformValidationOptions
} from 'class-transformer-validator';
import * as apiEnums from '../enums/_index';
import { ServerError } from './server-error';

export function transformValidSync<T extends object>(item: {
  classType: ClassType<T>;
  object: object;
  options?: TransformValidationOptions;
  errorMessage: apiEnums.ErEnum;
}) {
  let valid: T;
  try {
    valid = transformAndValidateSync(item.classType, item.object, item.options);
  } catch (e) {
    throw new ServerError({
      message: item.errorMessage,
      data: e,
      originalError: null
    });
  }
  return valid;
}
