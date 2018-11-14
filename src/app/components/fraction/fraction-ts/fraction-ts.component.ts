// tslint:disable-next-line:max-line-length
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatSelectChange } from '@angular/material';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { Moment } from 'moment';
import { IDatePickerConfig } from 'ng2-date-picker';
import { tap } from 'rxjs/operators';
import * as api from 'app/api/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import * as services from 'app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-fraction-ts',
  templateUrl: 'fraction-ts.component.html',
  styleUrls: ['fraction-ts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionTsComponent implements OnInit, OnChanges {
  fractionTypeEnum = api.FractionTypeEnum;
  fractionOperatorEnum = api.FractionOperatorEnum;

  fractionTsRelativeUnitEnum = api.FractionTsRelativeUnitEnum;
  fractionTsRelativeCompleteOptionEnum =
    api.FractionTsRelativeCompleteOptionEnum;
  fractionTsRelativeWhenOptionEnum = api.FractionTsRelativeWhenOptionEnum;

  fractionTsForOptionEnum = api.FractionTsForOptionEnum;
  fractionTsForUnitEnum = api.FractionTsForUnitEnum;

  fractionTsLastUnitEnum = api.FractionTsLastUnitEnum;
  fractionTsLastCompleteOptionEnum = api.FractionTsLastCompleteOptionEnum;

  date: Moment;
  dateTo: Moment;

  @Input() fraction: api.Fraction;
  @Input() isFirst: boolean;

  @Output() fractionChange = new EventEmitter();

  forValueForm: FormGroup;

  relativeValueForm: FormGroup;

  lastValueForm: FormGroup;

  yearConfig: IDatePickerConfig = {
    disableKeypress: true,
    format: 'YYYY',
    enableMonthSelector: true,
    showNearMonthDays: false,
    showTwentyFourHours: true,
    timeSeparator: ':',
    showMultipleYearsNavigation: false,
    showGoToCurrent: false
  };

  monthConfig: IDatePickerConfig = {
    disableKeypress: true,
    format: 'YYYY/MM',
    enableMonthSelector: true,
    showNearMonthDays: false,
    showTwentyFourHours: true,
    timeSeparator: ':',
    showMultipleYearsNavigation: false,
    showGoToCurrent: false
  };

  dayConfig: IDatePickerConfig = {
    disableKeypress: true,
    format: 'YYYY/MM/DD',
    enableMonthSelector: true,
    showNearMonthDays: false,
    showTwentyFourHours: true,
    timeSeparator: ':',
    showMultipleYearsNavigation: false,
    showGoToCurrent: false
  };

  hourConfig: IDatePickerConfig = {
    disableKeypress: true,
    format: 'YYYY/MM/DD HH',
    enableMonthSelector: true,
    showNearMonthDays: false,
    showTwentyFourHours: true,
    timeSeparator: ':',
    showMultipleYearsNavigation: false,
    showGoToCurrent: false
  };

  minuteConfig: IDatePickerConfig = {
    // appendTo: document.body,
    // locale: 'en',
    disableKeypress: true,
    // drops: 'down',
    format: 'YYYY/MM/DD HH:mm',
    // onOpenDelay: 0,
    // opens: 'right',
    // closeOnSelect: undefined,
    // openOnClick: true,
    // openOnFocus: true,
    // closeOnSelectDelay: 100,
    // allowMultiSelect: false,
    // dayBtnFormat: 'DD',
    // dayBtnFormatter
    // dayBtnCssClassCallback
    enableMonthSelector: true,
    // isDayDisabledCallback
    // monthFormat: 'MMM, YYYY',
    // monthFormatter
    showNearMonthDays: false,
    // showWeekNumbers: false,
    // isMonthDisabledCallback
    // max
    // min
    // monthBtnFormat: 'MMM',
    // monthBtnFormatter
    // monthBtnCssClassCallback
    yearFormat: 'YYYY',
    // yearFormatter
    // hours12Format: 'hh',
    // hours24Format: 'HH',
    // maxTime
    // meridiemFormat: 'A',
    // minTime
    // minutesFormat: 'mm',
    // minutesInterval: 1,
    // secondsFormat: 'ss',
    // secondsInterval: 1,
    // showSeconds: false,
    showTwentyFourHours: true,
    timeSeparator: ':',
    showMultipleYearsNavigation: false,
    multipleYearsNavigateBy: 10,
    // hideInputContainer: false
    // weekDayFormat: 'ddd',
    // weekDayFormatter
    showGoToCurrent: false
  };

  weekStart$ = this.store.select(selectors.getSelectedProjectWeekStart).pipe(
    tap(x => {
      let weekStart =
        x === api.ProjectWeekStartEnum.Monday
          ? 'mo'
          : x === api.ProjectWeekStartEnum.Sunday
          ? 'su'
          : undefined;

      this.yearConfig = Object.assign({}, this.yearConfig, {
        firstDayOfWeek: weekStart
      });
      this.monthConfig = Object.assign({}, this.monthConfig, {
        firstDayOfWeek: weekStart
      });
      this.dayConfig = Object.assign({}, this.dayConfig, {
        firstDayOfWeek: weekStart
      });
      this.hourConfig = Object.assign({}, this.hourConfig, {
        firstDayOfWeek: weekStart
      });
      this.minuteConfig = Object.assign({}, this.minuteConfig, {
        firstDayOfWeek: weekStart
      });
    })
  );

  constructor(
    private store: Store<interfaces.AppState>,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.resetDateUsingFraction();
    this.resetDateToUsingFraction();

    this.buildForValueForm();
    this.buildRelativeValueForm();
    this.buildLastValueForm();
  }

  buildForValueForm() {
    this.forValueForm = this.fb.group({
      forValue: [
        this.fraction.ts_for_value,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });
  }

  buildRelativeValueForm() {
    this.relativeValueForm = this.fb.group({
      relativeValue: [
        this.fraction.ts_relative_value,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });
  }

  buildLastValueForm() {
    this.lastValueForm = this.fb.group({
      lastValue: [
        this.fraction.ts_last_value,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.resetDateUsingFraction();
    this.resetDateToUsingFraction();
  }

  resetDateUsingFraction() {
    let dateNow = moment();

    this.date = moment({
      year: this.fraction.ts_date_year || dateNow.year(),
      month: this.fraction.ts_date_month ? this.fraction.ts_date_month - 1 : 0,
      day: this.fraction.ts_date_day ? this.fraction.ts_date_day : 1,
      hour: this.fraction.ts_date_hour ? this.fraction.ts_date_hour : 0,
      minute: this.fraction.ts_date_minute ? this.fraction.ts_date_minute : 0,
      second: 0,
      millisecond: 0
    });
  }

  resetDateToUsingFraction() {
    let dateNow = moment();

    this.dateTo = moment({
      year: this.fraction.ts_date_to_year || dateNow.year(),
      month: this.fraction.ts_date_to_month
        ? this.fraction.ts_date_to_month - 1
        : 0,
      day: this.fraction.ts_date_to_day ? this.fraction.ts_date_to_day : 1,
      hour: this.fraction.ts_date_to_hour ? this.fraction.ts_date_to_hour : 0,
      minute: this.fraction.ts_date_to_minute
        ? this.fraction.ts_date_to_minute
        : 0,
      second: 0,
      millisecond: 0
    });
  }

  getMinuteString(date: Moment) {
    let year = date.year();
    let month =
      (date.month() + 1).toString().length > 1
        ? date.month() + 1
        : `0${date.month() + 1}`;
    let day =
      date.date().toString().length > 1 ? date.date() : `0${date.date()}`;
    let hour =
      date.hour().toString().length > 1 ? date.hour() : `0${date.hour()}`;
    let minute =
      date.minute().toString().length > 1 ? date.minute() : `0${date.minute()}`;

    return `${year}/${month}/${day} ${hour}:${minute}`;
  }

  getHourString(date: Moment) {
    let year = date.year();
    let month =
      (date.month() + 1).toString().length > 1
        ? date.month() + 1
        : `0${date.month() + 1}`;
    let day =
      date.date().toString().length > 1 ? date.date() : `0${date.date()}`;
    let hour =
      date.hour().toString().length > 1 ? date.hour() : `0${date.hour()}`;

    return `${year}/${month}/${day} ${hour}`;
  }

  getDayString(date: Moment) {
    let year = date.year();
    let month =
      (date.month() + 1).toString().length > 1
        ? date.month() + 1
        : `0${date.month() + 1}`;
    let day =
      date.date().toString().length > 1 ? date.date() : `0${date.date()}`;

    return `${year}/${month}/${day}`;
  }

  getMonthString(date: Moment) {
    let year = date.year();
    let month =
      (date.month() + 1).toString().length > 1
        ? date.month() + 1
        : `0${date.month() + 1}`;

    return `${year}/${month}`;
  }

  getYearString(date: Moment) {
    let year = date.year();

    return `${year}`;
  }

  typeChange(ev: MatSelectChange) {
    switch (ev.value) {
      case this.fractionTypeEnum.TsIsAnyValue: {
        this.fraction = {
          brick: `any`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.TsIsOnYear: {
        let newBrick = `on ${this.getYearString(this.date)}`;

        this.fraction = {
          brick: newBrick,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          ts_date_year: this.date.year()
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.TsIsOnMonth: {
        let newBrick = `on ${this.getMonthString(this.date)}`;

        this.fraction = {
          brick: newBrick,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          ts_date_year: this.date.year(),
          ts_date_month: this.date.month() + 1
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.TsIsOnDay: {
        let newBrick = `on ${this.getDayString(this.date)}`;

        this.fraction = {
          brick: newBrick,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          ts_date_year: this.date.year(),
          ts_date_month: this.date.month() + 1,
          ts_date_day: this.date.date()
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.TsIsOnHour: {
        let newBrick = `on ${this.getHourString(this.date)}`;

        this.fraction = {
          brick: newBrick,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          ts_date_year: this.date.year(),
          ts_date_month: this.date.month() + 1,
          ts_date_day: this.date.date(),
          ts_date_hour: this.date.hour()
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.TsIsOnMinute: {
        this.buildFractionMinute();

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.TsIsInRange: {
        this.buildFractionRange();

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.TsIsBeforeDate: {
        this.buildFractionBeforeDate();

        if (
          this.fraction.ts_for_option ===
            api.FractionTsForOptionEnum.ForInfinity ||
          this.forValueForm.valid
        ) {
          this.emitFractionChange();
        }
        break;
      }

      case this.fractionTypeEnum.TsIsAfterDate: {
        this.buildFractionAfterDate();

        if (
          this.fraction.ts_for_option ===
            api.FractionTsForOptionEnum.ForInfinity ||
          this.forValueForm.valid
        ) {
          this.emitFractionChange();
        }
        break;
      }

      case this.fractionTypeEnum.TsIsBeforeRelative: {
        this.fraction = Object.assign({}, this.fraction, {
          ts_relative_value:
            this.relativeValueForm.controls['relativeValue'].value || 1
        });
        this.buildRelativeValueForm();

        this.buildFractionBeforeRelative();

        if (
          this.relativeValueForm.valid &&
          (this.fraction.ts_for_option ===
            api.FractionTsForOptionEnum.ForInfinity ||
            this.forValueForm.valid)
        ) {
          this.emitFractionChange();
        }
        break;
      }

      case this.fractionTypeEnum.TsIsAfterRelative: {
        this.fraction = Object.assign({}, this.fraction, {
          ts_relative_value:
            this.relativeValueForm.controls['relativeValue'].value || 1
        });
        this.buildRelativeValueForm();

        this.buildFractionAfterRelative();

        if (
          this.relativeValueForm.valid &&
          (this.fraction.ts_for_option ===
            api.FractionTsForOptionEnum.ForInfinity ||
            this.forValueForm.valid)
        ) {
          this.emitFractionChange();
        }
        break;
      }

      case this.fractionTypeEnum.TsIsInLast: {
        this.fraction = Object.assign({}, this.fraction, {
          ts_last_value: this.lastValueForm.controls['lastValue'].value || 1
        });
        this.buildLastValueForm();

        this.buildFractionLast();

        if (this.lastValueForm.valid) {
          this.emitFractionChange();
        }
        break;
      }

      case this.fractionTypeEnum.TsIsNull: {
        this.fraction = {
          brick: `null`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.TsIsNotNull: {
        this.fraction = {
          brick: `not null`,
          operator: api.FractionOperatorEnum.And,
          type: ev.value
        };

        this.emitFractionChange();
        break;
      }

      default: {
      }
    }
  }

  yearClosed() {
    if (this.date.year() !== this.fraction.ts_date_year) {
      let newBrick = `on ${this.getYearString(this.date)}`;

      this.fraction = {
        brick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        ts_date_year: this.date.year()
      };

      this.emitFractionChange();
    }
  }

  monthClosed() {
    if (
      this.date.year() !== this.fraction.ts_date_year ||
      this.date.month() + 1 !== this.fraction.ts_date_month
    ) {
      let newBrick = `on ${this.getMonthString(this.date)}`;

      this.fraction = {
        brick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        ts_date_year: this.date.year(),
        ts_date_month: this.date.month() + 1
      };

      this.emitFractionChange();
    }
  }

  dayClosed() {
    if (
      this.date.year() !== this.fraction.ts_date_year ||
      this.date.month() + 1 !== this.fraction.ts_date_month ||
      this.date.date() !== this.fraction.ts_date_day
    ) {
      let newBrick = `on ${this.getDayString(this.date)}`;

      this.fraction = {
        brick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        ts_date_year: this.date.year(),
        ts_date_month: this.date.month() + 1,
        ts_date_day: this.date.date()
      };

      this.emitFractionChange();
    }
  }

  hourClosed() {
    if (
      this.date.year() !== this.fraction.ts_date_year ||
      this.date.month() + 1 !== this.fraction.ts_date_month ||
      this.date.date() !== this.fraction.ts_date_day ||
      this.date.hour() !== this.fraction.ts_date_hour
    ) {
      let newBrick = `on ${this.getHourString(this.date)}`;

      this.fraction = {
        brick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        ts_date_year: this.date.year(),
        ts_date_month: this.date.month() + 1,
        ts_date_day: this.date.date(),
        ts_date_hour: this.date.hour()
      };

      this.emitFractionChange();
    }
  }

  minuteClosed() {
    if (!this.dateIsEqualToFractionDate()) {
      this.buildFractionMinute();

      this.emitFractionChange();
    }
  }

  rangeFromClosed() {
    if (!this.dateIsEqualToFractionDate()) {
      this.buildFractionRange();

      this.emitFractionChange();
    }
  }

  rangeToClosed() {
    if (!this.dateToIsEqualToFractionDateTo()) {
      this.buildFractionRange();

      this.emitFractionChange();
    }
  }

  beforeDateClosed() {
    if (!this.dateIsEqualToFractionDate()) {
      this.buildFractionBeforeDate();

      if (
        this.fraction.ts_for_option ===
          api.FractionTsForOptionEnum.ForInfinity ||
        this.forValueForm.valid
      ) {
        this.emitFractionChange();
      }
    }
  }

  afterDateClosed() {
    if (!this.dateIsEqualToFractionDate()) {
      this.buildFractionAfterDate();

      if (
        this.fraction.ts_for_option ===
          api.FractionTsForOptionEnum.ForInfinity ||
        this.forValueForm.valid
      ) {
        this.emitFractionChange();
      }
    }
  }

  dateIsEqualToFractionDate(): boolean {
    return (
      this.date.year() === this.fraction.ts_date_year &&
      this.date.month() + 1 === this.fraction.ts_date_month &&
      this.date.date() === this.fraction.ts_date_day &&
      this.date.hour() === this.fraction.ts_date_hour &&
      this.date.minute() === this.fraction.ts_date_minute
    );
  }

  dateToIsEqualToFractionDateTo(): boolean {
    return (
      this.dateTo.year() === this.fraction.ts_date_to_year &&
      this.dateTo.month() + 1 === this.fraction.ts_date_to_month &&
      this.dateTo.date() === this.fraction.ts_date_to_day &&
      this.dateTo.hour() === this.fraction.ts_date_to_hour &&
      this.dateTo.minute() === this.fraction.ts_date_to_minute
    );
  }

  forOptionChange(ev: MatSelectChange) {
    if (ev.value === api.FractionTsForOptionEnum.For) {
      this.fraction = Object.assign({}, this.fraction, {
        ts_for_option: ev.value,
        ts_for_value: 1,
        ts_for_unit: api.FractionTsForUnitEnum.Weeks
      });
      this.buildForValueForm();
    } else if (ev.value === api.FractionTsForOptionEnum.ForInfinity) {
      this.fraction = Object.assign({}, this.fraction, {
        ts_for_option: ev.value,
        ts_for_value: null,
        ts_for_unit: null
      });
      this.buildForValueForm();
    }

    this.forSwitch();
  }

  forValueBlur(forValue: FormControl) {
    if (forValue.value !== this.fraction.ts_for_value) {
      this.fraction = Object.assign({}, this.fraction, {
        ts_for_value: forValue.value
      });

      this.forSwitch();
    }
  }

  forUnitChange(ev: MatSelectChange) {
    this.fraction = Object.assign({}, this.fraction, { ts_for_unit: ev.value });

    this.forSwitch();
  }

  forSwitch() {
    switch (this.fraction.type) {
      case api.FractionTypeEnum.TsIsBeforeDate: {
        this.buildFractionBeforeDate();

        if (
          this.fraction.ts_for_option ===
            api.FractionTsForOptionEnum.ForInfinity ||
          this.forValueForm.valid
        ) {
          this.emitFractionChange();
        }
        break;
      }

      case api.FractionTypeEnum.TsIsAfterDate: {
        this.buildFractionAfterDate();

        if (
          this.fraction.ts_for_option ===
            api.FractionTsForOptionEnum.ForInfinity ||
          this.forValueForm.valid
        ) {
          this.emitFractionChange();
        }
        break;
      }

      case api.FractionTypeEnum.TsIsBeforeRelative: {
        this.buildFractionBeforeRelative();

        if (
          this.relativeValueForm.valid &&
          (this.fraction.ts_for_option ===
            api.FractionTsForOptionEnum.ForInfinity ||
            this.forValueForm.valid)
        ) {
          this.emitFractionChange();
        }
        break;
      }

      case api.FractionTypeEnum.TsIsAfterRelative: {
        this.buildFractionAfterRelative();

        if (
          this.relativeValueForm.valid &&
          (this.fraction.ts_for_option ===
            api.FractionTsForOptionEnum.ForInfinity ||
            this.forValueForm.valid)
        ) {
          this.emitFractionChange();
        }
        break;
      }

      default: {
      }
    }
  }

  relativeValueBlur(relativeValue: FormControl) {
    if (relativeValue.value !== this.fraction.ts_relative_value) {
      this.fraction = Object.assign({}, this.fraction, {
        ts_relative_value: relativeValue.value
      });

      this.relativeSwitch();
    }
  }

  relativeUnitChange(ev: MatSelectChange) {
    this.fraction = Object.assign({}, this.fraction, {
      ts_relative_unit: ev.value
    });

    this.relativeSwitch();
  }

  relativeCompleteChange(ev: MatSelectChange) {
    this.fraction = Object.assign({}, this.fraction, {
      ts_relative_complete_option: ev.value
    });

    this.relativeSwitch();
  }

  relativeWhenChange(ev: MatSelectChange) {
    this.fraction = Object.assign({}, this.fraction, {
      ts_relative_when_option: ev.value
    });

    this.relativeSwitch();
  }

  relativeSwitch() {
    switch (this.fraction.type) {
      case api.FractionTypeEnum.TsIsBeforeRelative: {
        this.buildFractionBeforeRelative();

        if (
          this.relativeValueForm.valid &&
          (this.fraction.ts_for_option ===
            api.FractionTsForOptionEnum.ForInfinity ||
            this.forValueForm.valid)
        ) {
          this.emitFractionChange();
        }
        break;
      }

      case api.FractionTypeEnum.TsIsAfterRelative: {
        this.buildFractionAfterRelative();

        if (
          this.relativeValueForm.valid &&
          (this.fraction.ts_for_option ===
            api.FractionTsForOptionEnum.ForInfinity ||
            this.forValueForm.valid)
        ) {
          this.emitFractionChange();
        }
        break;
      }

      default: {
      }
    }
  }

  lastValueBlur(lastValue: FormControl) {
    if (lastValue.value !== this.fraction.ts_last_value) {
      this.fraction = Object.assign({}, this.fraction, {
        ts_last_value: lastValue.value
      });

      this.buildFractionLast();

      if (this.lastValueForm.valid) {
        this.emitFractionChange();
      }
    }
  }

  lastUnitChange(ev: MatSelectChange) {
    this.fraction = Object.assign({}, this.fraction, {
      ts_last_unit: ev.value
    });

    this.buildFractionLast();

    if (this.lastValueForm.valid) {
      this.emitFractionChange();
    }
  }

  lastCompleteChange(ev: MatSelectChange) {
    this.fraction = Object.assign({}, this.fraction, {
      ts_last_complete_option: ev.value
    });

    this.buildFractionLast();

    if (this.lastValueForm.valid) {
      this.emitFractionChange();
    }
  }

  buildFractionMinute() {
    let newBrick = `on ${this.getMinuteString(this.date)}`;

    this.fraction = {
      brick: newBrick,
      operator: api.FractionOperatorEnum.Or,
      type: api.FractionTypeEnum.TsIsOnMinute,
      ts_date_year: this.date.year(),
      ts_date_month: this.date.month() + 1,
      ts_date_day: this.date.date(),
      ts_date_hour: this.date.hour(),
      ts_date_minute: this.date.minute()
    };
  }

  buildFractionRange() {
    let newBrick = `on ${this.getMinuteString(
      this.date
    )} to ${this.getMinuteString(this.dateTo)}`;

    this.fraction = {
      brick: newBrick,
      operator: api.FractionOperatorEnum.Or,
      type: api.FractionTypeEnum.TsIsInRange,
      ts_date_year: this.date.year(),
      ts_date_month: this.date.month() + 1,
      ts_date_day: this.date.date(),
      ts_date_hour: this.date.hour(),
      ts_date_minute: this.date.minute(),

      ts_date_to_year: this.dateTo.year(),
      ts_date_to_month: this.dateTo.month() + 1,
      ts_date_to_day: this.dateTo.date(),
      ts_date_to_hour: this.dateTo.hour(),
      ts_date_to_minute: this.dateTo.minute()
    };
  }

  buildFractionBeforeDate() {
    let newTsForOption =
      this.fraction.ts_for_option || api.FractionTsForOptionEnum.ForInfinity;

    let newBrick =
      newTsForOption === api.FractionTsForOptionEnum.ForInfinity
        ? `before ${this.getMinuteString(this.date)}`
        : `before ${this.getMinuteString(this.date)} for ${
            this.fraction.ts_for_value
          } ${this.fraction.ts_for_unit}`;

    this.fraction = {
      brick: newBrick,
      operator: api.FractionOperatorEnum.Or,
      type: api.FractionTypeEnum.TsIsBeforeDate,
      ts_date_year: this.date.year(),
      ts_date_month: this.date.month() + 1,
      ts_date_day: this.date.date(),
      ts_date_hour: this.date.hour(),
      ts_date_minute: this.date.minute(),

      ts_for_option: newTsForOption,
      ts_for_value: this.fraction.ts_for_value,
      ts_for_unit: this.fraction.ts_for_unit
    };
  }

  buildFractionAfterDate() {
    let newTsForOption =
      this.fraction.ts_for_option || api.FractionTsForOptionEnum.ForInfinity;

    let newBrick =
      newTsForOption === api.FractionTsForOptionEnum.ForInfinity
        ? `after ${this.getMinuteString(this.date)}`
        : `after ${this.getMinuteString(this.date)} for ${
            this.fraction.ts_for_value
          } ${this.fraction.ts_for_unit}`;

    this.fraction = {
      brick: newBrick,
      operator: api.FractionOperatorEnum.Or,
      type: api.FractionTypeEnum.TsIsAfterDate,
      ts_date_year: this.date.year(),
      ts_date_month: this.date.month() + 1,
      ts_date_day: this.date.date(),
      ts_date_hour: this.date.hour(),
      ts_date_minute: this.date.minute(),

      ts_for_option: newTsForOption,
      ts_for_value: this.fraction.ts_for_value,
      ts_for_unit: this.fraction.ts_for_unit
    };
  }

  buildFractionBeforeRelative() {
    let newRelativeValue = this.fraction.ts_relative_value;
    let newRelativeUnit =
      this.fraction.ts_relative_unit || api.FractionTsRelativeUnitEnum.Weeks;
    let newRelativeCompleteOption =
      this.fraction.ts_relative_complete_option ||
      api.FractionTsRelativeCompleteOptionEnum.Incomplete;
    let newRelativeWhenOption =
      this.fraction.ts_relative_when_option ||
      api.FractionTsRelativeWhenOptionEnum.Ago;
    let newTsForOption =
      this.fraction.ts_for_option || api.FractionTsForOptionEnum.ForInfinity;

    let newPart =
      newRelativeCompleteOption ===
      api.FractionTsRelativeCompleteOptionEnum.Incomplete
        ? `${newRelativeValue} ${newRelativeUnit}`
        : `${newRelativeValue} ${newRelativeUnit} complete`;

    let newPart2 =
      newRelativeWhenOption === api.FractionTsRelativeWhenOptionEnum.Ago
        ? `${newPart} ago`
        : `${newPart} in future`;

    let newBrick =
      newTsForOption === api.FractionTsForOptionEnum.ForInfinity
        ? `before ${newPart2}`
        : `before ${newPart2} for ${this.fraction.ts_for_value} ${
            this.fraction.ts_for_unit
          }`;

    this.fraction = {
      brick: newBrick,
      operator: api.FractionOperatorEnum.Or,
      type: api.FractionTypeEnum.TsIsBeforeRelative,

      ts_relative_value: newRelativeValue,
      ts_relative_unit: newRelativeUnit,
      ts_relative_complete_option: newRelativeCompleteOption,
      ts_relative_when_option: newRelativeWhenOption,

      ts_for_option: newTsForOption,
      ts_for_value: this.fraction.ts_for_value,
      ts_for_unit: this.fraction.ts_for_unit
    };
  }

  buildFractionAfterRelative() {
    let newRelativeValue = this.fraction.ts_relative_value;
    let newRelativeUnit =
      this.fraction.ts_relative_unit || api.FractionTsRelativeUnitEnum.Weeks;
    let newRelativeCompleteOption =
      this.fraction.ts_relative_complete_option ||
      api.FractionTsRelativeCompleteOptionEnum.Incomplete;
    let newRelativeWhenOption =
      this.fraction.ts_relative_when_option ||
      api.FractionTsRelativeWhenOptionEnum.Ago;
    let newTsForOption =
      this.fraction.ts_for_option || api.FractionTsForOptionEnum.ForInfinity;

    let newPart =
      newRelativeCompleteOption ===
      api.FractionTsRelativeCompleteOptionEnum.Incomplete
        ? `${newRelativeValue} ${newRelativeUnit}`
        : `${newRelativeValue} ${newRelativeUnit} complete`;

    let newPart2 =
      newRelativeWhenOption === api.FractionTsRelativeWhenOptionEnum.Ago
        ? `${newPart} ago`
        : `${newPart} in future`;

    let newBrick =
      newTsForOption === api.FractionTsForOptionEnum.ForInfinity
        ? `after ${newPart2}`
        : `after ${newPart2} for ${this.fraction.ts_for_value} ${
            this.fraction.ts_for_unit
          }`;

    this.fraction = {
      brick: newBrick,
      operator: api.FractionOperatorEnum.Or,
      type: api.FractionTypeEnum.TsIsAfterRelative,

      ts_relative_value: newRelativeValue,
      ts_relative_unit: newRelativeUnit,
      ts_relative_complete_option: newRelativeCompleteOption,
      ts_relative_when_option: newRelativeWhenOption,

      ts_for_option: newTsForOption,
      ts_for_value: this.fraction.ts_for_value,
      ts_for_unit: this.fraction.ts_for_unit
    };
  }

  buildFractionLast() {
    let newLastValue = this.fraction.ts_last_value;
    let newLastUnit =
      this.fraction.ts_last_unit || api.FractionTsLastUnitEnum.Weeks;
    let newLastCompleteOption =
      this.fraction.ts_last_complete_option ||
      api.FractionTsLastCompleteOptionEnum.Incomplete;

    let newBrick =
      newLastCompleteOption === api.FractionTsLastCompleteOptionEnum.Incomplete
        ? `last ${newLastValue} ${newLastUnit}`
        : newLastCompleteOption ===
          api.FractionTsLastCompleteOptionEnum.Complete
        ? `last ${newLastValue} ${newLastUnit} complete`
        : `last ${newLastValue} ${newLastUnit} complete plus current`;

    this.fraction = {
      brick: newBrick,
      operator: api.FractionOperatorEnum.Or,
      type: api.FractionTypeEnum.TsIsInLast,

      ts_last_value: newLastValue,
      ts_last_unit: newLastUnit,
      ts_last_complete_option: newLastCompleteOption
    };
  }

  emitFractionChange() {
    this.fractionChange.emit(this.fraction);
  }
}
