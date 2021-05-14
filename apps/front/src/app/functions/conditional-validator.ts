import { ValidatorFn } from '@angular/forms';

export function conditionalValidator(
  predicate: () => boolean,
  validator: ValidatorFn
) {
  return (formControl: any) => {
    if (!formControl.parent) {
      return null;
    }
    if (predicate()) {
      return validator(formControl);
    }
    return null;
  };
}
