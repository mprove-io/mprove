/* eslint-disable @typescript-eslint/ban-types */
import {
  ClassType,
  transformAndValidate,
  TransformValidationOptions
} from 'class-transformer-validator';
import { enums } from '~api/barrels/enums';
import { ServerError } from '~api/models/server-error';

export async function transformValid<T extends object>(item: {
  classType: ClassType<T>;
  object: object;
  options?: TransformValidationOptions;
  errorMessage: enums.ErEnum;
}) {
  let valid = await transformAndValidate(
    item.classType,
    item.object,
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
