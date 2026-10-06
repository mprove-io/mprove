import type { FormControl } from '@angular/forms';

export type KeyValueFormControls = {
  key: FormControl<string>;
  value: FormControl<string>;
};
