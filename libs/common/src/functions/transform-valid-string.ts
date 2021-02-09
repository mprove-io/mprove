/* eslint-disable @typescript-eslint/ban-types */
import {
  ClassType,
  transformAndValidate,
  TransformValidationOptions
} from 'class-transformer-validator';
import { ServerError } from '~common/models/server-error';

export async function transformValidString<T extends object>(item: {
  classType: ClassType<T>;
  jsonString: string;
  options?: TransformValidationOptions;
  errorMessage: any;
}) {
  let valid = await transformAndValidate(
    item.classType,
    item.jsonString,
    item.options
  ).catch(e => {
    throw new ServerError({
      message: item.errorMessage,
      data: e,
      originalError: null
    });
  });
  return valid;
}