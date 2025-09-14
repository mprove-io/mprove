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

// this.editBigqueryForm = this.fb.group({
//   bigqueryQuerySizeLimitGb: [
//     1,
//     [
//       ValidationService.integerOrEmptyValidator,
//       conditionalValidator(
//         () =>
//           [ConnectionTypeEnum.BigQuery].indexOf(
//             this.addConnectionForm.get('type').value
//           ) > -1,
//         Validators.required
//       )
//     ]
//   ]
// });
