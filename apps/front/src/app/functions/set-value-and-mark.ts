import { AbstractControl } from '@angular/forms';

export function setValueAndMark(item: {
  control: AbstractControl;
  value: any;
}) {
  let { control, value } = item;

  control.setValue(value);
  control.markAsTouched();
}
