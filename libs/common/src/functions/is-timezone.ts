import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator
} from 'class-validator';
import { isTimezoneValid } from './is-timezone-valid';

@ValidatorConstraint({ async: false })
export class IsTimezoneConstraint implements ValidatorConstraintInterface {
  validate(timezone: any, args: ValidationArguments) {
    return isTimezoneValid(timezone);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Wrong timezone';
  }
}

export function IsTimezone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTimezoneConstraint
    });
  };
}
