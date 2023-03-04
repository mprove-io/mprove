import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { isUserTimezoneValid } from './is-user-timezone-valid';

@ValidatorConstraint({ async: false })
export class IsUserTimezoneConstraint implements ValidatorConstraintInterface {
  validate(timezone: any, args: ValidationArguments) {
    return isUserTimezoneValid(timezone);
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'Wrong User Timezone';
  }
}

export function IsUserTimezone(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserTimezoneConstraint
    });
  };
}
