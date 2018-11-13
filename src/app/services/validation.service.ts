import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import * as enums from 'app/enums/_index';
import { MyRegex } from 'app/models/my-regex';
import { BackendService } from 'app/services/backend.service';
import { PrinterService } from 'app/services/printer.service';

@Injectable()
export class ValidationService {

  constructor(
    private backendService: BackendService,
    private printer: PrinterService,
    private router: Router
  ) {

  }

  static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    let config = new Map([
      ['required', 'Required'],
      ['minlength', `Minimum length ${validatorValue.requiredLength}`],
      ['maxlength', `Maximum length ${validatorValue.requiredLength}`],
      ['min', `Min value ${validatorValue.min}`],
      ['max', `Max value ${validatorValue.max}`],
      ['email', 'Invalid email address'],
      ['pattern', 'Invalid pattern'],
      ['isNotDayOfWeekIndexValues', 'Should be Day of week indexes separated by comma'],
      ['isNotNumberValues', 'Should be Numbers separated by comma'],
      ['isNotNumber', 'Is not a number'],
      ['isNotInteger', 'Value must be integer'],
      ['containsThreeUnderscores', 'File name can not contain "___"'],
      ['moreThenOneMB', 'Text must be < 1mb'],
      ['projectNameIsNotUnique', 'Project name already exists'],
      ['projectNameIsNotValid', 'Project name is not valid'],
    ]);

    return config.get(validatorName);
  }

  static dayOfWeekIndexValuesValidator(control: FormControl) {
    if (control.value === null) { return null; }

    if (control.value.match(MyRegex.IS_DAY_OF_WEEK_INDEX_VALUES())) {
      return null;

    } else {
      return { isNotDayOfWeekIndexValues: true };
    }
  }

  static numberValuesValidator(control: FormControl) {
    if (control.value === null) { return null; }

    if (control.value.match(MyRegex.IS_NUMBER_VALUES())) {
      return null;

    } else {
      return { isNotNumberValues: true };
    }
  }

  static numberValidator(control: FormControl) {
    // console.log({ v: control.value });
    if (control.value === null) { return null; }

    if (control.value.toString().match(MyRegex.IS_NUMBER())) {
      return null;

    } else {
      return { isNotNumber: true };
    }
  }

  static integerValidator(control: FormControl) {
    if (control.value === null) { return null; }

    if (control.value.toString().match(MyRegex.IS_INTEGER())) {
      return null;

    } else {
      return { isNotInteger: true };
    }
  }

  static doesNotContainThreeUnderscores(control: FormControl) {
    if (control.value === null) { return null; }

    if (!control.value.match(/___/)) {
      return null;

    } else {
      return { containsThreeUnderscores: true };
    }
  }

  static checkTextSize(control: FormControl) {
    if (control.value === null) { return null; }

    return (control.value.length > 0 && control.value.length <= 1048576) ?
      null : { moreThenOneMB: true };
  }

  projectNameCheck(control: FormControl) {

    const q = new Promise((resolve, reject) => {

      if (control.value === null || control.value === '') {
        resolve(null);

      } else {
        this.backendService.checkProjectIdUnique({ project_id: control.value })
          .pipe(
            map(body => {
              if (!body.payload.is_unique) {
                resolve({ projectNameIsNotUnique: true });

              } else if (!body.payload.is_valid) {
                resolve({ projectNameIsNotValid: true });

              } else {
                resolve(null);
              }
              return of(1);
            }),
            catchError((e) => {
              this.printer.log(enums.busEnum.VALIDATION_SERVICE, `caught error accessing API`);
              this.router.navigate(['/404']);

              return e;
            }),
            take(1)
          )
          .subscribe();
      }
    });

    return q;
  }
}
