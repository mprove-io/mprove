import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { en_US, NzI18nService } from 'ng-zorro-antd/i18n';
import { EventFractionUpdate } from '~front/app/modules/model/model-filters/model-filters.component';
import { ValidationService } from '~front/app/services/validation.service';
import { common } from '~front/barrels/common';
import { FractionTypeItem } from '../fraction.component';

@Component({
  selector: 'm-fraction-ts',
  templateUrl: 'fraction-ts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionTsComponent implements OnInit, OnChanges {
  fractionTypeEnum = common.FractionTypeEnum;

  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  date: Date;
  dateTo: Date;

  fractionTypeForm: FormGroup;

  forValueForm: FormGroup;
  relativeValueForm: FormGroup;
  lastValueForm: FormGroup;

  nzMinuteStep = 60;
  nzSecondStep = 60;

  fractionTsTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: common.FractionTypeEnum.TsIsAnyValue
    },
    {
      label: 'is on Year',
      value: common.FractionTypeEnum.TsIsOnYear
    },
    {
      label: 'is on Month',
      value: common.FractionTypeEnum.TsIsOnMonth
    },
    {
      label: 'is on Day',
      value: common.FractionTypeEnum.TsIsOnDay
    },
    {
      label: 'is on Hour',
      value: common.FractionTypeEnum.TsIsOnHour
    },
    {
      label: 'is on Minute',
      value: common.FractionTypeEnum.TsIsOnMinute
    },
    {
      label: 'is in range',
      value: common.FractionTypeEnum.TsIsInRange
    },
    {
      label: 'is before',
      value: common.FractionTypeEnum.TsIsBeforeDate
    },
    {
      label: 'is after',
      value: common.FractionTypeEnum.TsIsAfterDate
    },
    {
      label: 'is before (relative)',
      value: common.FractionTypeEnum.TsIsBeforeRelative
    },
    {
      label: 'is after (relative)',
      value: common.FractionTypeEnum.TsIsAfterRelative
    },
    {
      label: 'is in last',
      value: common.FractionTypeEnum.TsIsInLast
    },
    {
      label: 'is null',
      value: common.FractionTypeEnum.TsIsNull
    },
    {
      label: 'is not null',
      value: common.FractionTypeEnum.TsIsNotNull
    }
  ];

  constructor(
    private fb: FormBuilder,
    private i18n: NzI18nService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.i18n.setLocale(en_US);

    this.buildFractionTypeForm();

    this.resetDateUsingFraction();
    this.resetDateToUsingFraction();

    this.buildForValueForm();
    this.buildRelativeValueForm();
    this.buildLastValueForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.resetDateUsingFraction();
    this.resetDateToUsingFraction();
  }

  buildForValueForm() {
    this.forValueForm = this.fb.group({
      forValue: [
        this.fraction.tsForValue,
        Validators.compose([
          Validators.required,
          ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });
  }

  buildRelativeValueForm() {
    this.relativeValueForm = this.fb.group({
      relativeValue: [
        this.fraction.tsRelativeValue,
        Validators.compose([
          Validators.required,
          ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });
  }

  buildLastValueForm() {
    this.lastValueForm = this.fb.group({
      lastValue: [
        this.fraction.tsLastValue,
        Validators.compose([
          Validators.required,
          ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });
  }

  resetDateUsingFraction() {
    let now = new Date();

    let year = this.fraction.tsDateYear || now.getFullYear();
    let monthIndex = common.isDefined(this.fraction.tsDateMonth)
      ? this.fraction.tsDateMonth - 1
      : 0;
    let day = common.isDefined(this.fraction.tsDateDay)
      ? this.fraction.tsDateDay
      : 1;
    let hour = common.isDefined(this.fraction.tsDateHour)
      ? this.fraction.tsDateHour
      : 0;
    let minute = common.isDefined(this.fraction.tsDateMinute)
      ? this.fraction.tsDateMinute
      : 0;
    let second = 0;
    let millisecond = 0;

    this.date = new Date(
      year,
      monthIndex,
      day,
      hour,
      minute,
      second,
      millisecond
    );

    this.date.setFullYear(year);
  }

  resetDateToUsingFraction() {
    let now = new Date();

    let year = this.fraction.tsDateToYear || now.getFullYear();
    let monthIndex = common.isDefined(this.fraction.tsDateToMonth)
      ? this.fraction.tsDateToMonth - 1
      : 0;
    let day = common.isDefined(this.fraction.tsDateToDay)
      ? this.fraction.tsDateToDay
      : 1;
    let hour = common.isDefined(this.fraction.tsDateToHour)
      ? this.fraction.tsDateToHour
      : 0;
    let minute = common.isDefined(this.fraction.tsDateToMinute)
      ? this.fraction.tsDateToMinute
      : 0;
    let second = 0;
    let millisecond = 0;

    this.dateTo = new Date(
      year,
      monthIndex,
      day,
      hour,
      minute,
      second,
      millisecond
    );

    this.dateTo.setFullYear(year);
  }

  buildFractionTypeForm() {
    this.fractionTypeForm = this.fb.group({
      fractionType: [this.fraction.type]
    });
  }

  typeChange(fractionTypeItem: FractionTypeItem) {
    let fractionType = fractionTypeItem.value;

    switch (fractionType) {
      case this.fractionTypeEnum.TsIsAnyValue: {
        this.fraction = {
          brick: `any`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnYear: {
        this.date = new Date();

        this.fraction = {
          brick: `on ${this.getYearString(this.date)}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          tsDateYear: this.date.getFullYear()
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnMonth: {
        this.date = new Date();

        this.fraction = {
          brick: `on ${this.getMonthString(this.date)}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          tsDateYear: this.date.getFullYear(),
          tsDateMonth: this.date.getMonth() + 1
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnDay: {
        this.date = new Date();

        this.fraction = {
          brick: `on ${this.getDayString(this.date)}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          tsDateYear: this.date.getFullYear(),
          tsDateMonth: this.date.getMonth() + 1,
          tsDateDay: this.date.getDate()
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnHour: {
        this.date = new Date();
        this.date.setMinutes(0);
        this.date.setSeconds(0);

        this.fraction = {
          brick: `on ${this.getHourString(this.date)}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          tsDateYear: this.date.getFullYear(),
          tsDateMonth: this.date.getMonth() + 1,
          tsDateDay: this.date.getDate(),
          tsDateHour: this.date.getHours()
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnMinute: {
        this.date = new Date();
        this.date.setSeconds(0);

        this.fraction = {
          brick: `on ${this.getMinuteString(this.date)}`,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.TsIsOnMinute,
          tsDateYear: this.date.getFullYear(),
          tsDateMonth: this.date.getMonth() + 1,
          tsDateDay: this.date.getDate(),
          tsDateHour: this.date.getHours(),
          tsDateMinute: this.date.getMinutes()
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsInRange: {
        this.buildFractionRange();

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsBeforeDate: {
        this.buildFractionBeforeDate();

        if (
          this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
          this.forValueForm.valid
        ) {
          this.emitFractionUpdate();
        }
        break;
      }

      case this.fractionTypeEnum.TsIsAfterDate: {
        this.buildFractionAfterDate();

        if (
          this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
          this.forValueForm.valid
        ) {
          this.emitFractionUpdate();
        }
        break;
      }

      case this.fractionTypeEnum.TsIsBeforeRelative: {
        this.fraction = Object.assign({}, this.fraction, {
          tsRelativeValue:
            this.relativeValueForm.controls['relativeValue'].value || 1
        });
        this.buildRelativeValueForm();

        this.buildFractionBeforeRelative();

        if (
          this.relativeValueForm.valid &&
          (this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
            this.forValueForm.valid)
        ) {
          this.emitFractionUpdate();
        }
        break;
      }

      case this.fractionTypeEnum.TsIsAfterRelative: {
        this.fraction = Object.assign({}, this.fraction, {
          tsRelativeValue:
            this.relativeValueForm.controls['relativeValue'].value || 1
        });
        this.buildRelativeValueForm();

        this.buildFractionAfterRelative();

        if (
          this.relativeValueForm.valid &&
          (this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
            this.forValueForm.valid)
        ) {
          this.emitFractionUpdate();
        }
        break;
      }

      case this.fractionTypeEnum.TsIsInLast: {
        this.fraction = Object.assign({}, this.fraction, {
          tsLastValue: this.lastValueForm.controls['lastValue'].value || 1
        });
        this.buildLastValueForm();

        this.buildFractionLast();

        if (this.lastValueForm.valid) {
          this.emitFractionUpdate();
        }
        break;
      }

      case this.fractionTypeEnum.TsIsNull: {
        this.fraction = {
          brick: `null`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsNotNull: {
        this.fraction = {
          brick: `not null`,
          operator: common.FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      default: {
      }
    }
  }

  getYearString(date: Date) {
    let year = this.getYearPart(date);

    return `${year}`;
  }

  getMonthString(date: Date) {
    let year = this.getYearPart(date);
    let month = this.getMonthPart(date);

    return `${year}/${month}`;
  }

  getDayString(date: Date) {
    let year = this.getYearPart(date);
    let month = this.getMonthPart(date);
    let day = this.getDayPart(date);

    return `${year}/${month}/${day}`;
  }

  getHourString(date: Date) {
    let year = this.getYearPart(date);
    let month = this.getMonthPart(date);
    let day = this.getDayPart(date);
    let hour = this.getHourPart(date);

    return `${year}/${month}/${day} ${hour}`;
  }

  getMinuteString(date: Date) {
    let year = this.getYearPart(date);
    let month = this.getMonthPart(date);
    let day = this.getDayPart(date);
    let hour = this.getHourPart(date);
    let minute = this.getMinutePart(date);

    return `${year}/${month}/${day} ${hour}:${minute}`;
  }

  // parts

  getYearPart(date: Date) {
    let fullYear = date.getFullYear();
    let fullYearString = fullYear.toString();
    let fullYearStringLength = fullYearString.length;

    let year =
      fullYearStringLength === 1
        ? `000${fullYear}`
        : fullYearStringLength === 2
        ? `00${fullYear}`
        : fullYearStringLength === 3
        ? `0${fullYear}`
        : `${fullYear}`;

    return `${year}`;
  }

  getMonthPart(date: Date) {
    let month =
      (date.getMonth() + 1).toString().length > 1
        ? date.getMonth() + 1
        : `0${date.getMonth() + 1}`;

    return `${month}`;
  }

  getDayPart(date: Date) {
    let day =
      date.getDate().toString().length > 1
        ? date.getDate()
        : `0${date.getDate()}`;

    return `${day}`;
  }

  getHourPart(date: Date) {
    let hour =
      date.getHours().toString().length > 1
        ? date.getHours()
        : `0${date.getHours()}`;

    return `${hour}`;
  }

  getMinutePart(date: Date) {
    let minute =
      date.getMinutes().toString().length > 1
        ? date.getMinutes()
        : `0${date.getMinutes()}`;

    return `${minute}`;
  }

  //

  buildFractionRange() {
    this.fraction = {
      brick: `on ${this.getMinuteString(this.date)} to ${this.getMinuteString(
        this.dateTo
      )}`,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsInRange,
      tsDateYear: this.date.getFullYear(),
      tsDateMonth: this.date.getMonth() + 1,
      tsDateDay: this.date.getDate(),
      tsDateHour: this.date.getHours(),
      tsDateMinute: this.date.getMinutes(),

      tsDateToYear: this.dateTo.getFullYear(),
      tsDateToMonth: this.dateTo.getMonth() + 1,
      tsDateToDay: this.dateTo.getDate(),
      tsDateToHour: this.dateTo.getHours(),
      tsDateToMinute: this.dateTo.getMinutes()
    };
  }

  buildFractionBeforeDate() {
    let newTsForOption =
      this.fraction.tsForOption || common.FractionTsForOptionEnum.ForInfinity;

    let newBrick =
      newTsForOption === common.FractionTsForOptionEnum.ForInfinity
        ? `before ${this.getMinuteString(this.date)}`
        : `before ${this.getMinuteString(this.date)} for ${
            this.fraction.tsForValue
          } ${this.fraction.tsForUnit}`;

    this.fraction = {
      brick: newBrick,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsBeforeDate,
      tsDateYear: this.date.getFullYear(),
      tsDateMonth: this.date.getMonth() + 1,
      tsDateDay: this.date.getDate(),
      tsDateHour: this.date.getHours(),
      tsDateMinute: this.date.getMinutes(),

      tsForOption: newTsForOption,
      tsForValue: this.fraction.tsForValue,
      tsForUnit: this.fraction.tsForUnit
    };
  }

  buildFractionAfterDate() {
    let newTsForOption =
      this.fraction.tsForOption || common.FractionTsForOptionEnum.ForInfinity;

    let newBrick =
      newTsForOption === common.FractionTsForOptionEnum.ForInfinity
        ? `after ${this.getMinuteString(this.date)}`
        : `after ${this.getMinuteString(this.date)} for ${
            this.fraction.tsForValue
          } ${this.fraction.tsForUnit}`;

    this.fraction = {
      brick: newBrick,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsAfterDate,
      tsDateYear: this.date.getFullYear(),
      tsDateMonth: this.date.getMonth() + 1,
      tsDateDay: this.date.getDate(),
      tsDateHour: this.date.getHours(),
      tsDateMinute: this.date.getMinutes(),

      tsForOption: newTsForOption,
      tsForValue: this.fraction.tsForValue,
      tsForUnit: this.fraction.tsForUnit
    };
  }

  buildFractionBeforeRelative() {
    let newRelativeValue = this.fraction.tsRelativeValue;
    let newRelativeUnit =
      this.fraction.tsRelativeUnit || common.FractionTsRelativeUnitEnum.Weeks;
    let newRelativeCompleteOption =
      this.fraction.tsRelativeCompleteOption ||
      common.FractionTsRelativeCompleteOptionEnum.Incomplete;
    let newRelativeWhenOption =
      this.fraction.tsRelativeWhenOption ||
      common.FractionTsRelativeWhenOptionEnum.Ago;
    let newTsForOption =
      this.fraction.tsForOption || common.FractionTsForOptionEnum.ForInfinity;

    let newPart =
      newRelativeCompleteOption ===
      common.FractionTsRelativeCompleteOptionEnum.Incomplete
        ? `${newRelativeValue} ${newRelativeUnit}`
        : `${newRelativeValue} ${newRelativeUnit} complete`;

    let newPart2 =
      newRelativeWhenOption === common.FractionTsRelativeWhenOptionEnum.Ago
        ? `${newPart} ago`
        : `${newPart} in future`;

    let newBrick =
      newTsForOption === common.FractionTsForOptionEnum.ForInfinity
        ? `before ${newPart2}`
        : `before ${newPart2} for ${this.fraction.tsForValue} ${this.fraction.tsForUnit}`;

    this.fraction = {
      brick: newBrick,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsBeforeRelative,

      tsRelativeValue: newRelativeValue,
      tsRelativeUnit: newRelativeUnit,
      tsRelativeCompleteOption: newRelativeCompleteOption,
      tsRelativeWhenOption: newRelativeWhenOption,

      tsForOption: newTsForOption,
      tsForValue: this.fraction.tsForValue,
      tsForUnit: this.fraction.tsForUnit
    };
  }

  buildFractionAfterRelative() {
    let newRelativeValue = this.fraction.tsRelativeValue;
    let newRelativeUnit =
      this.fraction.tsRelativeUnit || common.FractionTsRelativeUnitEnum.Weeks;
    let newRelativeCompleteOption =
      this.fraction.tsRelativeCompleteOption ||
      common.FractionTsRelativeCompleteOptionEnum.Incomplete;
    let newRelativeWhenOption =
      this.fraction.tsRelativeWhenOption ||
      common.FractionTsRelativeWhenOptionEnum.Ago;
    let newTsForOption =
      this.fraction.tsForOption || common.FractionTsForOptionEnum.ForInfinity;

    let newPart =
      newRelativeCompleteOption ===
      common.FractionTsRelativeCompleteOptionEnum.Incomplete
        ? `${newRelativeValue} ${newRelativeUnit}`
        : `${newRelativeValue} ${newRelativeUnit} complete`;

    let newPart2 =
      newRelativeWhenOption === common.FractionTsRelativeWhenOptionEnum.Ago
        ? `${newPart} ago`
        : `${newPart} in future`;

    let newBrick =
      newTsForOption === common.FractionTsForOptionEnum.ForInfinity
        ? `after ${newPart2}`
        : `after ${newPart2} for ${this.fraction.tsForValue} ${this.fraction.tsForUnit}`;

    this.fraction = {
      brick: newBrick,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsAfterRelative,

      tsRelativeValue: newRelativeValue,
      tsRelativeUnit: newRelativeUnit,
      tsRelativeCompleteOption: newRelativeCompleteOption,
      tsRelativeWhenOption: newRelativeWhenOption,

      tsForOption: newTsForOption,
      tsForValue: this.fraction.tsForValue,
      tsForUnit: this.fraction.tsForUnit
    };
  }

  buildFractionLast() {
    let newLastValue = this.fraction.tsLastValue;
    let newLastUnit =
      this.fraction.tsLastUnit || common.FractionTsLastUnitEnum.Weeks;
    let newLastCompleteOption =
      this.fraction.tsLastCompleteOption ||
      common.FractionTsLastCompleteOptionEnum.Incomplete;

    let newBrick =
      newLastCompleteOption ===
      common.FractionTsLastCompleteOptionEnum.Incomplete
        ? `last ${newLastValue} ${newLastUnit}`
        : newLastCompleteOption ===
          common.FractionTsLastCompleteOptionEnum.Complete
        ? `last ${newLastValue} ${newLastUnit} complete`
        : `last ${newLastValue} ${newLastUnit} complete plus current`;

    this.fraction = {
      brick: newBrick,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsInLast,

      tsLastValue: newLastValue,
      tsLastUnit: newLastUnit,
      tsLastCompleteOption: newLastCompleteOption
    };
  }

  yearOpenClose() {
    if (this.date.getFullYear() !== this.fraction.tsDateYear) {
      this.fraction = {
        brick: `on ${this.getYearString(this.date)}`,
        operator: this.fraction.operator,
        type: this.fraction.type,
        tsDateYear: this.date.getFullYear()
      };

      this.emitFractionUpdate();
    }
  }

  monthOpenClose() {
    if (
      this.date.getFullYear() !== this.fraction.tsDateYear ||
      this.date.getMonth() + 1 !== this.fraction.tsDateMonth
    ) {
      this.fraction = {
        brick: `on ${this.getMonthString(this.date)}`,
        operator: this.fraction.operator,
        type: this.fraction.type,
        tsDateYear: this.date.getFullYear(),
        tsDateMonth: this.date.getMonth() + 1
      };

      this.emitFractionUpdate();
    }
  }

  dayOpenClose() {
    if (
      this.date.getFullYear() !== this.fraction.tsDateYear ||
      this.date.getMonth() + 1 !== this.fraction.tsDateMonth ||
      this.date.getDate() !== this.fraction.tsDateDay
    ) {
      this.fraction = {
        brick: `on ${this.getDayString(this.date)}`,
        operator: this.fraction.operator,
        type: this.fraction.type,
        tsDateYear: this.date.getFullYear(),
        tsDateMonth: this.date.getMonth() + 1,
        tsDateDay: this.date.getDate()
      };

      this.emitFractionUpdate();
    }
  }

  hourOpenClose() {
    if (
      this.date.getFullYear() !== this.fraction.tsDateYear ||
      this.date.getMonth() + 1 !== this.fraction.tsDateMonth ||
      this.date.getDate() !== this.fraction.tsDateDay ||
      this.date.getHours() !== this.fraction.tsDateHour ||
      this.date.getMinutes() !== 0 ||
      this.date.getSeconds() !== 0
    ) {
      this.fraction = {
        brick: `on ${this.getHourString(this.date)}`,
        operator: this.fraction.operator,
        type: this.fraction.type,
        tsDateYear: this.date.getFullYear(),
        tsDateMonth: this.date.getMonth() + 1,
        tsDateDay: this.date.getDate(),
        tsDateHour: this.date.getHours()
      };

      this.emitFractionUpdate();
    }
  }

  disabledMinutes() {
    return [0];
    // Array.from(Array(60).keys());
  }

  disabledSeconds() {
    return [0];
    // Array.from(Array(60).keys());
  }

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }
}
