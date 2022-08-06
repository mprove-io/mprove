/* eslint-disable @typescript-eslint/ban-types */
import {
  ClassType,
  transformAndValidateSync,
  TransformValidationOptions
} from 'class-transformer-validator';
import { ValidationError } from 'class-validator';
import { ServerError } from '~common/models/server-error';
import { isDefined } from './is-defined';
import { logToConsole } from './log-to-console';

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
    let constraints;

    if (Array.isArray(e)) {
      constraints = getConstraintsRecursive(e);
    }

    logToConsole(constraints); // default ExceptionHandler doesn't log error.data

    throw new ServerError({
      message: item.errorMessage,
      data: constraints,
      originalError: null
    });
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
