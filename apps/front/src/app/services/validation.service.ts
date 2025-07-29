import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { formatSpecifier } from 'd3-format';
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
      ['isNotLowerCaseValues', 'Must be lowercase'],
      ['isNotNumber', 'Is not a number'],
      ['isNotInteger', 'integer'],
      ['isNotZero', 'Cannot be 0'],
      ['containsThreeUnderscores', 'File name cannot contain "___"'],
      ['moreThenOneMB', 'Text must be < 1mb'],
      ['projectNameIsNotUnique', 'Project name already exists'],
      ['projectNameIsNotValid', 'Project name is not valid'],
      ['wrongFormatNumber', 'Wrong format number'],
      ['titleIsNotUnique', 'Tile title must be unique for dashboard'],
      ['connectionNameWrongChars', 'Use only "a-z0-9_" chars'],
      ['fileNameWrongChars', 'Use only "a-z0-9_" chars'],
      ['envVariableNameWrongChars', 'Use only "A-Z0-9_" chars'],
      [
        'labelIsNotUnique',
        'Filter label must be unique for filter labels and Ids'
      ]
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
    if (common.isUndefined(control.value) || control.value === '') {
      return null;
    }

    if (control.value.match(common.MyRegex.IS_DAY_OF_WEEK_INDEX_VALUES())) {
      return null;
    } else {
      return { isNotDayOfWeekIndexValues: true };
    }
  }

  static lowerCaseValidator(control: FormControl) {
    if (common.isUndefined(control.value) || control.value === '') {
      return null;
    }

    if (control.value.match(common.MyRegex.HAS_UPPERCASE_VALUES())) {
      return { isNotLowerCaseValues: true };
    } else {
      return null;
    }
  }

  static numberValuesOrEmptyValidator(control: FormControl) {
    if (common.isUndefined(control.value) || control.value === '') {
      return null;
    }

    if (control.value.match(common.MyRegex.IS_NUMBER_VALUES())) {
      return null;
    } else {
      return { isNotNumberValues: true };
    }
  }

  static formatNumberValidator(control: FormControl) {
    if (common.isUndefined(control.value) || control.value === '') {
      return null;
    }

    try {
      formatSpecifier(control.value);
    } catch (e) {
      return { wrongFormatNumber: true };
    }
    return null;
  }

  static numberOrEmptyValidator(control: FormControl) {
    if (common.isUndefined(control.value) || control.value === '') {
      return null;
    }

    if (control.value.toString().match(common.MyRegex.IS_NUMBER())) {
      return null;
    } else {
      return { isNotNumber: true };
    }
  }

  static integerOrEmptyValidator(control: FormControl) {
    if (common.isUndefined(control.value) || control.value === '') {
      return null;
    }

    if (control.value.toString().match(common.MyRegex.IS_INTEGER())) {
      return null;
    } else {
      return { isNotInteger: true };
    }
  }

  static fileNameWrongChars(control: FormControl) {
    if (common.isUndefined(control.value) || control.value === '') {
      return null;
    }

    let wrongChars: string[] = [];

    let reg2 = common.MyRegex.CAPTURE_NOT_ALLOWED_VIEW_REF_CHARS_G();
    let r2;

    while ((r2 = reg2.exec(control.value.toString()))) {
      wrongChars.push(r2[1]);
    }

    if (wrongChars.length === 0) {
      return null;
    } else {
      return { fileNameWrongChars: true };
    }
  }

  static connectionNameWrongChars(control: FormControl) {
    if (common.isUndefined(control.value) || control.value === '') {
      return null;
    }

    let wrongChars: string[] = [];

    let reg2 = common.MyRegex.CAPTURE_NOT_ALLOWED_CONNECTION_NAME_CHARS_G();
    let r2;

    while ((r2 = reg2.exec(control.value.toString()))) {
      wrongChars.push(r2[1]);
    }

    if (wrongChars.length === 0) {
      return null;
    } else {
      return { connectionNameWrongChars: true };
    }
  }

  static envVariableNameWrongChars(control: FormControl) {
    if (common.isUndefined(control.value) || control.value === '') {
      return null;
    }

    let wrongChars: string[] = [];

    let reg2 = common.MyRegex.CAPTURE_NOT_ALLOWED_ENV_VAR_CHARS_G();
    let r2;

    while ((r2 = reg2.exec(control.value.toString()))) {
      wrongChars.push(r2[1]);
    }

    if (wrongChars.length === 0) {
      return null;
    } else {
      return { envVariableNameWrongChars: true };
    }
  }

  static notZeroOrEmptyValidator(control: FormControl) {
    if (common.isUndefined(control.value) || control.value === '') {
      return null;
    }

    if (control.value !== 0 && control.value !== '0') {
      return null;
    } else {
      return { isNotZero: true };
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
    if (common.isUndefined(control.value) || control.value === '') {
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
