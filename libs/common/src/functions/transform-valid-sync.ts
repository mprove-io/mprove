/* eslint-disable @typescript-eslint/ban-types */
import { Logger } from '@nestjs/common';
import {
  ClassType,
  transformAndValidateSync,
  TransformValidationOptions
} from 'class-transformer-validator';
import { ValidationError } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { ServerError } from '~common/models/server-error';
import { BoolEnum } from '~common/_index';
import { enumToBoolean } from './enum-to-boolean';
import { isDefined } from './is-defined';
import { logToConsole } from './log-to-console';

export function transformValidSync<T extends object>(item: {
  classType: ClassType<T>;
  object: object;
  options?: TransformValidationOptions;
  errorMessage: any;
  logIsJson: BoolEnum;
  logger: Logger;
}) {
  let { classType, object, options, errorMessage, logIsJson, logger } = item;

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
      data: constraints,
      originalError: null
    });

    if (
      [
        enums.ErEnum.BACKEND_WRONG_ENV_VALUES,
        enums.ErEnum.BLOCKML_WRONG_ENV_VALUES,
        enums.ErEnum.DISK_WRONG_ENV_VALUES
      ].indexOf(errorMessage) > -1
    ) {
      logToConsole({
        log: serverError, // default exception handler doesn't print constraints (error.data)
        logIsJson: isDefined(logIsJson) ? enumToBoolean(logIsJson) : false,
        logger: logger,
        logLevel: enums.LogLevelEnum.Error
      });
    }

    throw serverError;
  }
  return valid;
}

export function getConstraintsRecursive(
  nestedValidationErrors: ValidationError[]
) {
  return nestedValidationErrors.reduce(
    (allConstraints, nestedObject: ValidationError): any[] => {
      if (isDefined(nestedObject.constraints)) {
        allConstraints.push(nestedObject.constraints);
      }

      if (nestedObject.children) {
        allConstraints = [
          ...allConstraints,
          ...getConstraintsRecursive(nestedObject.children)
        ];
      }

      return allConstraints;
    },
    []
  );
}

// export async function transformValidString<T extends object>(item: {
//   classType: ClassType<T>;
//   jsonString: string;
//   options?: TransformValidationOptions;
//   errorMessage: any;
// }) {
//   let valid = await transformAndValidate(
//     item.classType,
//     item.jsonString,
//     item.options
//   ).catch(e => {
//     throw new ServerError({
//       message: item.errorMessage,
//       data: e,
//       originalError: null
//     });
//   });
//   return valid;
// }

// export async function transformValid<T extends object>(item: {
//   classType: ClassType<T>;
//   object: object;
//   options?: TransformValidationOptions;
//   errorMessage: any;
// }) {
//   let valid = await transformAndValidate(
//     item.classType,
//     item.object,
//     item.options
//   ).catch(e => {
//     throw new ServerError({
//       message: item.errorMessage,
//       data: e,
//       originalError: null
//     });
//   });
//   return valid;
// }
