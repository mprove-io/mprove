import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { common } from '~front/barrels/common';

@Injectable({ providedIn: 'root' })
export class ValidationService {
  constructor() {}

  static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    let config = new Map([
      ['noPasswordMatch', 'Passwords do not match'],
      ['required', 'Required'],
      ['minlength', `Minimum length: ${validatorValue.requiredLength}`],
      ['maxlength', `Maximum length: ${validatorValue.requiredLength}`],
      ['min', `Min value: ${validatorValue.min}`],
      ['max', `Max value: ${validatorValue.max}`],
      ['email', 'Invalid email address'],
      ['pattern', 'Invalid pattern'],
      [
        'isNotDayOfWeekIndexValues',
        'Should be Day of week indexes separated by comma'
      ],
      ['isNotNumberValues', 'Should be Numbers separated by comma'],
      ['isNotNumber', 'Is not a number'],
      ['isNotInteger', 'Value must be integer'],
      ['containsThreeUnderscores', 'File name can not contain "___"'],
      ['moreThenOneMB', 'Text must be < 1mb'],
      ['projectNameIsNotUnique', 'Project name already exists'],
      ['projectNameIsNotValid', 'Project name is not valid']
    ]);

    return config.get(validatorName);
  }

  static passwordMatchValidator(
    group: AbstractControl
  ): ValidationErrors | null {
    const newPassword: string = group.get('newPassword').value;
    const confirmPassword: string = group.get('confirmPassword').value;
    if (newPassword !== confirmPassword) {
      group.get('confirmPassword').setErrors({ noPasswordMatch: true });
    }
    return null;
  }

  static dayOfWeekIndexValuesValidator(control: FormControl) {
    if (control.value === null) {
      return null;
    }

    if (control.value.match(common.MyRegex.IS_DAY_OF_WEEK_INDEX_VALUES())) {
      return null;
    } else {
      return { isNotDayOfWeekIndexValues: true };
    }
  }

  static numberValuesValidator(control: FormControl) {
    if (control.value === null) {
      return null;
    }

    if (control.value.match(common.MyRegex.IS_NUMBER_VALUES())) {
      return null;
    } else {
      return { isNotNumberValues: true };
    }
  }

  static numberValidator(control: FormControl) {
    if (control.value === null) {
      return null;
    }

    if (control.value.toString().match(common.MyRegex.IS_NUMBER())) {
      return null;
    } else {
      return { isNotNumber: true };
    }
  }

  static integerValidator(control: FormControl) {
    if (control.value === null) {
      return null;
    }

    if (control.value.toString().match(common.MyRegex.IS_INTEGER())) {
      return null;
    } else {
      return { isNotInteger: true };
    }
  }

  // static doesNotContainThreeUnderscores(control: FormControl) {
  //   if (control.value === null) {
  //     return null;
  //   }

  //   if (!control.value.match(/___/)) {
  //     return null;
  //   } else {
  //     return { containsThreeUnderscores: true };
  //   }
  // }

  static checkTextSize(control: FormControl) {
    if (control.value === null) {
      return null;
    }

    return control.value.length > 0 && control.value.length <= 1048576
      ? null
      : { moreThenOneMB: true };
  }

  // projectNameCheck(control: FormControl) {
  //   const q = new Promise((resolve, reject) => {
  //     if (control.value === null || control.value === '') {
  //       resolve(null);
  //     } else {
  //       this.backendService
  //         .checkProjectIdUnique({ project_id: control.value })
  //         .pipe(
  //           map(body => {
  //             if (!body.payload.is_unique) {
  //               resolve({ projectNameIsNotUnique: true });
  //             } else if (!body.payload.is_valid) {
  //               resolve({ projectNameIsNotValid: true });
  //             } else {
  //               resolve(null);
  //             }
  //             return of(1);
  //           }),
  //           catchError(e => {
  //             this.printer.log(
  //               enums.busEnum.VALIDATION_SERVICE,
  //               `caught error accessing API`
  //             );
  //             this.router.navigate(['/404']);

  //             return e;
  //           }),
  //           take(1)
  //         )
  //         .subscribe();
  //     }
  //   });

  //   return q;
  // }
}
