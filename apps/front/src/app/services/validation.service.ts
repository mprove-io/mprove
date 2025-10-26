import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { formatSpecifier } from 'd3-format';
import { getMotherduckDatabaseWrongChars } from '~common/functions/check-motherduck-database-name';
import { isUndefined } from '~common/functions/is-undefined';
import { isUndefinedOrEmpty } from '~common/functions/is-undefined-or-empty';
import { MyRegex } from '~common/models/my-regex';

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
      ['isNotZeroToThreeDigitsInteger', '0-999'],
      ['isNotZero', 'Cannot be 0'],
      ['containsThreeUnderscores', 'File name cannot contain "___"'],
      ['moreThenOneMB', 'Text must be < 1mb'],
      ['projectNameIsNotUnique', 'Project name already exists'],
      ['projectNameIsNotValid', 'Project name is not valid'],
      ['wrongTimestamp', 'Wrong timestamp value'],
      ['wrongFormatNumber', 'Wrong format number'],
      ['titleIsNotUnique', 'Tile title must be unique for dashboard'],
      ['connectionNameWrongChars', 'Use only "a-z0-9_" chars'],
      ['fileNameWrongChars', 'Use only "a-z0-9_" chars'],
      ['envVariableNameWrongChars', 'Use only "A-Z0-9_" chars'],
      [
        'labelIsNotUnique',
        'Filter label must be unique for filter labels and Ids'
      ],
      ['motherduckDatabaseWrongChars', 'Use only "a-zA-Z0-9_-" chars']
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
    if (isUndefined(control.value) || control.value === '') {
      return null;
    }

    if (control.value.match(MyRegex.IS_DAY_OF_WEEK_INDEX_VALUES())) {
      return null;
    } else {
      return { isNotDayOfWeekIndexValues: true };
    }
  }

  static lowerCaseValidator(control: FormControl) {
    if (isUndefined(control.value) || control.value === '') {
      return null;
    }

    if (control.value.match(MyRegex.HAS_UPPERCASE_VALUES())) {
      return { isNotLowerCaseValues: true };
    } else {
      return null;
    }
  }

  static numberValuesOrEmptyValidator(control: FormControl) {
    if (isUndefined(control.value) || control.value === '') {
      return null;
    }

    if (control.value.match(MyRegex.IS_NUMBER_VALUES())) {
      return null;
    } else {
      return { isNotNumberValues: true };
    }
  }

  static timestampValidator(control: FormControl) {
    let value = control.value;

    if (isUndefinedOrEmpty(value)) {
      return null;
    }

    if (value.endsWith('.')) {
      return { wrongTimestamp: true };
    } else if (value.match(MyRegex.IS_TIMESTAMP())) {
      // Additional validation for date correctness (e.g., leap years, month lengths)
      let [datePart, timePart] = value.replace('T', ' ').split(' ');
      let [year, month, day] = datePart.split('-').map(Number);

      let timePartBeforeDot = timePart.split('.')[0];

      let [hour, minute, second] = timePartBeforeDot.split(':').map(Number);

      let date = new Date(year, month - 1, day, hour, minute, second);

      let yearCheck = date.getFullYear();
      let monthCheck = date.getMonth() + 1;
      let dayCheck = date.getDate();
      let hourCheck = date.getHours();
      let minuteCheck = date.getMinutes();
      let secondCheck = date.getSeconds();

      if (
        yearCheck === year &&
        monthCheck === month &&
        dayCheck === day &&
        hourCheck === hour &&
        minuteCheck === minute &&
        secondCheck === second
      ) {
        return null;
      } else {
        return { wrongTimestamp: true };
      }
    } else {
      return { wrongTimestamp: true };
    }
  }

  static formatNumberValidator(control: FormControl) {
    if (isUndefined(control.value) || control.value === '') {
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
    if (isUndefined(control.value) || control.value === '') {
      return null;
    }

    if (control.value.toString().match(MyRegex.IS_NUMBER())) {
      return null;
    } else {
      return { isNotNumber: true };
    }
  }

  static integerOrEmptyValidator(control: FormControl) {
    if (isUndefined(control.value) || control.value === '') {
      return null;
    }

    if (control.value.toString().match(MyRegex.IS_INTEGER())) {
      return null;
    } else {
      return { isNotInteger: true };
    }
  }

  static zeroToThreeDigitsIntegerOrEmptyValidator(control: FormControl) {
    if (isUndefined(control.value) || control.value === '') {
      return null;
    }

    if (
      control.value.toString().match(MyRegex.IS_ZERO_TO_THREE_DIGITS_INTEGER())
    ) {
      return null;
    } else {
      return { isNotZeroToThreeDigitsInteger: true };
    }
  }

  static fileNameWrongChars(control: FormControl) {
    if (isUndefined(control.value) || control.value === '') {
      return null;
    }

    let wrongChars: string[] = [];

    let reg2 = MyRegex.CAPTURE_NOT_ALLOWED_VIEW_REF_CHARS_G();
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
    if (isUndefined(control.value) || control.value === '') {
      return null;
    }

    let wrongChars: string[] = [];

    let reg2 = MyRegex.CAPTURE_NOT_ALLOWED_CONNECTION_NAME_CHARS_G();
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
    if (isUndefined(control.value) || control.value === '') {
      return null;
    }

    let wrongChars: string[] = [];

    let reg2 = MyRegex.CAPTURE_NOT_ALLOWED_ENV_VAR_CHARS_G();
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
    if (isUndefined(control.value) || control.value === '') {
      return null;
    }

    if (control.value !== 0 && control.value !== '0') {
      return null;
    } else {
      return { isNotZero: true };
    }
  }

  static checkTextSize(control: FormControl) {
    if (isUndefined(control.value) || control.value === '') {
      return null;
    }

    return control.value.length > 0 && control.value.length <= 1048576
      ? null
      : { moreThenOneMB: true };
  }

  static motherduckDatabaseWrongChars(control: FormControl) {
    let wrongChars: string[] = getMotherduckDatabaseWrongChars({
      databaseName: control.value
    });

    if (isUndefined(wrongChars) || wrongChars.length === 0) {
      return null;
    } else {
      return { motherduckDatabaseWrongChars: true };
    }
  }
}
