import type { AbstractControl } from '@angular/forms';

export function setValueAndMark<T>(item: {
  control: AbstractControl<T>;
  value: NoInfer<T>;
}) {
  let { control, value } = item;

  control.setValue(value);
  control.markAsTouched();
}
