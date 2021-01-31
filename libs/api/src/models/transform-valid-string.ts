/* eslint-disable @typescript-eslint/ban-types */
import {
  ClassType,
  transformAndValidate,
  TransformValidationOptions
} from 'class-transformer-validator';
import * as apiEnums from '~api/enums/_index';
import { ServerError } from './server-error';

export async function transformValidString<T extends object>(item: {
  classType: ClassType<T>;
  jsonString: string;
  options?: TransformValidationOptions;
  errorMessage: apiEnums.ErEnum;
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
