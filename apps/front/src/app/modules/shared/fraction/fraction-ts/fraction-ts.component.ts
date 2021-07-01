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
import {
  FractionTsForOptionItem,
  FractionTsForUnitItem,
  FractionTsRelativeCompleteOptionItem,
  FractionTsRelativeUnitItem,
  FractionTsRelativeWhenOptionItem,
  FractionTypeItem
} from '../fraction.component';

@Component({
  selector: 'm-fraction-ts',
  templateUrl: 'fraction-ts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionTsComponent implements OnInit, OnChanges {
  fractionTypeEnum = common.FractionTypeEnum;
  fractionTsForOptionEnum = common.FractionTsForOptionEnum;

  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  date: Date;
  dateTo: Date;

  fractionTypeForm: FormGroup;

  relativeValueForm: FormGroup;

  tsRelativeUnitForm: FormGroup;
  tsRelativeCompleteForm: FormGroup;
  tsRelativeWhenForm: FormGroup;

  tsForForm: FormGroup;
  tsForUnitForm: FormGroup;

  forValueForm: FormGroup;
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

  fractionTsRelativeUnitsList: FractionTsRelativeUnitItem[] = [
    {
      label: 'Years',
      value: common.FractionTsRelativeUnitEnum.Years
    },
    {
      label: 'Quarters',
      value: common.FractionTsRelativeUnitEnum.Quarters
    },
    {
      label: 'Months',
      value: common.FractionTsRelativeUnitEnum.Months
    },
    {
      label: 'Weeks',
      value: common.FractionTsRelativeUnitEnum.Weeks
    },
    {
      label: 'Days',
      value: common.FractionTsRelativeUnitEnum.Days
    },
    {
      label: 'Hours',
      value: common.FractionTsRelativeUnitEnum.Hours
    },
    {
      label: 'Minutes',
      value: common.FractionTsRelativeUnitEnum.Minutes
    }
  ];

  fractionTsRelativeCompleteOptionsList: FractionTsRelativeCompleteOptionItem[] = [
    {
      label: 'complete',
      value: common.FractionTsRelativeCompleteOptionEnum.Complete
    },
    {
      label: 'incomplete',
      value: common.FractionTsRelativeCompleteOptionEnum.Incomplete
    }
  ];

  fractionTsRelativeWhenOptionsList: FractionTsRelativeWhenOptionItem[] = [
    {
      label: 'ago',
      value: common.FractionTsRelativeWhenOptionEnum.Ago
    },
    {
      label: 'in future',
      value: common.FractionTsRelativeWhenOptionEnum.InFuture
    }
  ];

  fractionTsForOptionsList: FractionTsForOptionItem[] = [
    {
      label: 'for',
      value: common.FractionTsForOptionEnum.For
    },
    {
      label: 'for infinity',
      value: common.FractionTsForOptionEnum.ForInfinity
    }
  ];

  fractionTsForUnitsList: FractionTsForUnitItem[] = [
    {
      label: 'Years',
      value: common.FractionTsForUnitEnum.Years
    },
    {
      label: 'Quarters',
      value: common.FractionTsForUnitEnum.Quarters
    },
    {
      label: 'Months',
      value: common.FractionTsForUnitEnum.Months
    },
    {
      label: 'Weeks',
      value: common.FractionTsForUnitEnum.Weeks
    },
    {
      label: 'Days',
      value: common.FractionTsForUnitEnum.Days
    },
    {
      label: 'Hours',
      value: common.FractionTsForUnitEnum.Hours
    },
    {
      label: 'Minutes',
      value: common.FractionTsForUnitEnum.Minutes
    }
  ];

  constructor(
    private fb: FormBuilder,
    private i18n: NzI18nService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.i18n.setLocale(en_US);

    this.resetDateUsingFraction();
    this.resetDateToUsingFraction();

    this.buildFractionTypeForm();

    this.buildRelativeValueForm();
    this.buildTsRelativeUnitForm();
    this.buildTsRelativeCompleteForm();
    this.buildTsRelativeWhenForm();

    this.buildTsForForm();
    this.buildForValueForm();
    this.buildTsForUnitForm();

    this.buildLastValueForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.resetDateUsingFraction();
    this.resetDateToUsingFraction();
  }

  buildFractionTypeForm() {
    this.fractionTypeForm = this.fb.group({
      fractionType: [this.fraction.type]
    });
  }

  buildRelativeValueForm() {
    this.relativeValueForm = this.fb.group({
      tsRelativeValue: [
        this.fraction.tsRelativeValue,
        Validators.compose([
          Validators.required,
          ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });
  }

  buildTsRelativeUnitForm() {
    this.tsRelativeUnitForm = this.fb.group({
      tsRelativeUnit: [this.fraction.tsRelativeUnit]
    });
  }

  buildTsRelativeCompleteForm() {
    this.tsRelativeCompleteForm = this.fb.group({
      tsRelativeCompleteOption: [this.fraction.tsRelativeCompleteOption]
    });
  }

  buildTsRelativeWhenForm() {
    this.tsRelativeWhenForm = this.fb.group({
      tsRelativeWhenOption: [this.fraction.tsRelativeWhenOption]
    });
  }

  buildTsForForm() {
    this.tsForForm = this.fb.group({
      tsForOption: [this.fraction.tsForOption]
    });
  }

  buildForValueForm() {
    this.forValueForm = this.fb.group({
      tsForValue: [
        this.fraction.tsForValue,
        Validators.compose([
          Validators.required,
          ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });
  }

  buildTsForUnitForm() {
    this.tsForUnitForm = this.fb.group({
      tsForUnit: [this.fraction.tsForUnit]
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

  updateRelativeControls() {
    this.updateControlTsRelativeValueFromFraction();
    this.updateControlTsRelativeUnitFromFraction();
    this.updateControlTsRelativeCompleteOptionFromFraction();
    this.updateControlTsRelativeWhenOptionFromFraction();
  }

  updateForControls() {
    this.updateControlForOptionFromFraction();
    this.updateControlForValueFromFraction();
    this.updateControlForUnitFromFraction();
  }

  updateControlTsRelativeValueFromFraction() {
    this.relativeValueForm.controls['tsRelativeValue'].setValue(
      this.fraction.tsRelativeValue
    );
  }

  updateControlTsRelativeUnitFromFraction() {
    this.tsRelativeUnitForm.controls['tsRelativeUnit'].setValue(
      this.fraction.tsRelativeUnit
    );
  }

  updateControlTsRelativeCompleteOptionFromFraction() {
    this.tsRelativeCompleteForm.controls['tsRelativeCompleteOption'].setValue(
      this.fraction.tsRelativeCompleteOption
    );
  }

  updateControlTsRelativeWhenOptionFromFraction() {
    this.tsRelativeWhenForm.controls['tsRelativeWhenOption'].setValue(
      this.fraction.tsRelativeWhenOption
    );
  }

  updateControlForOptionFromFraction() {
    this.tsForForm.controls['tsForOption'].setValue(this.fraction.tsForOption);
  }

  updateControlForValueFromFraction() {
    this.forValueForm.controls['tsForValue'].setValue(this.fraction.tsForValue);
  }

  updateControlForUnitFromFraction() {
    this.tsForUnitForm.controls['tsForUnit'].setValue(this.fraction.tsForUnit);
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
        this.date = new Date();
        this.dateTo = new Date();

        this.date.setSeconds(0);
        this.dateTo.setSeconds(0);

        this.buildFractionRange();

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsBeforeDate: {
        this.date = new Date();
        this.date.setSeconds(0);

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
        this.date = new Date();
        this.date.setSeconds(0);

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
        this.fraction.tsRelativeValue = 1;
        this.fraction.tsRelativeUnit = common.FractionTsRelativeUnitEnum.Weeks;
        this.fraction.tsRelativeCompleteOption =
          common.FractionTsRelativeCompleteOptionEnum.Incomplete;
        this.fraction.tsRelativeWhenOption =
          common.FractionTsRelativeWhenOptionEnum.Ago;
        this.fraction.tsForOption = common.FractionTsForOptionEnum.ForInfinity;
        this.fraction.tsForValue = 1;
        this.fraction.tsForUnit = common.FractionTsForUnitEnum.Weeks;

        this.buildFractionBeforeRelative();

        this.updateRelativeControls();
        this.updateForControls();

        this.emitFractionUpdate();

        break;
      }

      case this.fractionTypeEnum.TsIsAfterRelative: {
        this.fraction.tsRelativeValue = 1;
        this.fraction.tsRelativeUnit = common.FractionTsRelativeUnitEnum.Weeks;
        this.fraction.tsRelativeCompleteOption =
          common.FractionTsRelativeCompleteOptionEnum.Incomplete;
        this.fraction.tsRelativeWhenOption =
          common.FractionTsRelativeWhenOptionEnum.Ago;
        this.fraction.tsForOption = common.FractionTsForOptionEnum.ForInfinity;
        this.fraction.tsForValue = 1;
        this.fraction.tsForUnit = common.FractionTsForUnitEnum.Weeks;

        this.buildFractionAfterRelative();

        this.updateRelativeControls();
        this.updateForControls();

        this.emitFractionUpdate();
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

    this.fraction = {
      brick:
        newTsForOption === common.FractionTsForOptionEnum.ForInfinity
          ? `before ${this.getMinuteString(this.date)}`
          : `before ${this.getMinuteString(this.date)} for ${
              this.fraction.tsForValue
            } ${this.fraction.tsForUnit}`,
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

    this.fraction = {
      brick:
        newTsForOption === common.FractionTsForOptionEnum.ForInfinity
          ? `after ${this.getMinuteString(this.date)}`
          : `after ${this.getMinuteString(this.date)} for ${
              this.fraction.tsForValue
            } ${this.fraction.tsForUnit}`,
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
    let newPart =
      this.fraction.tsRelativeCompleteOption ===
      common.FractionTsRelativeCompleteOptionEnum.Incomplete
        ? `${this.fraction.tsRelativeValue} ${this.fraction.tsRelativeUnit}`
        : `${this.fraction.tsRelativeValue} ${this.fraction.tsRelativeUnit} complete`;

    let newPart2 =
      this.fraction.tsRelativeWhenOption ===
      common.FractionTsRelativeWhenOptionEnum.Ago
        ? `${newPart} ago`
        : `${newPart} in future`;

    let newBrick =
      this.fraction.tsForOption === common.FractionTsForOptionEnum.ForInfinity
        ? `before ${newPart2}`
        : `before ${newPart2} for ${this.fraction.tsForValue} ${this.fraction.tsForUnit}`;

    this.fraction = {
      brick: newBrick,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsBeforeRelative,

      tsRelativeValue: this.fraction.tsRelativeValue,
      tsRelativeUnit: this.fraction.tsRelativeUnit,
      tsRelativeCompleteOption: this.fraction.tsRelativeCompleteOption,
      tsRelativeWhenOption: this.fraction.tsRelativeWhenOption,

      tsForOption: this.fraction.tsForOption,
      tsForValue: this.fraction.tsForValue,
      tsForUnit: this.fraction.tsForUnit
    };
  }

  buildFractionAfterRelative() {
    let newPart =
      this.fraction.tsRelativeCompleteOption ===
      common.FractionTsRelativeCompleteOptionEnum.Incomplete
        ? `${this.fraction.tsRelativeValue} ${this.fraction.tsRelativeUnit}`
        : `${this.fraction.tsRelativeValue} ${this.fraction.tsRelativeUnit} complete`;

    let newPart2 =
      this.fraction.tsRelativeWhenOption ===
      common.FractionTsRelativeWhenOptionEnum.Ago
        ? `${newPart} ago`
        : `${newPart} in future`;

    let newBrick =
      this.fraction.tsForOption === common.FractionTsForOptionEnum.ForInfinity
        ? `after ${newPart2}`
        : `after ${newPart2} for ${this.fraction.tsForValue} ${this.fraction.tsForUnit}`;

    this.fraction = {
      brick: newBrick,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsAfterRelative,

      tsRelativeValue: this.fraction.tsRelativeValue,
      tsRelativeUnit: this.fraction.tsRelativeUnit,
      tsRelativeCompleteOption: this.fraction.tsRelativeCompleteOption,
      tsRelativeWhenOption: this.fraction.tsRelativeWhenOption,

      tsForOption: this.fraction.tsForOption,
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

  minuteOpenClose() {
    if (this.isDateNotEqualFractionDateZeroSeconds()) {
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
    }
  }

  isDateNotEqualFractionDateZeroSeconds(): boolean {
    return (
      this.date.getFullYear() !== this.fraction.tsDateYear ||
      this.date.getMonth() + 1 !== this.fraction.tsDateMonth ||
      this.date.getDate() !== this.fraction.tsDateDay ||
      this.date.getHours() !== this.fraction.tsDateHour ||
      this.date.getMinutes() !== this.fraction.tsDateMinute ||
      this.date.getSeconds() !== 0
    );
  }

  isDateToNotEqualFractionDateToZeroSeconds(): boolean {
    return (
      this.dateTo.getFullYear() !== this.fraction.tsDateToYear ||
      this.dateTo.getMonth() + 1 !== this.fraction.tsDateToMonth ||
      this.dateTo.getDate() !== this.fraction.tsDateToDay ||
      this.dateTo.getHours() !== this.fraction.tsDateToHour ||
      this.dateTo.getMinutes() !== this.fraction.tsDateToMinute ||
      this.dateTo.getSeconds() !== 0
    );
  }

  rangeFromOpenClose() {
    if (this.isDateNotEqualFractionDateZeroSeconds()) {
      this.buildFractionRange();

      this.emitFractionUpdate();
    }
  }

  rangeToOpenClose() {
    if (this.isDateToNotEqualFractionDateToZeroSeconds()) {
      this.buildFractionRange();

      this.emitFractionUpdate();
    }
  }

  disabledMinutes() {
    return [0];
  }

  disabledSeconds() {
    return [0];
  }

  beforeOpenClose() {
    if (this.isDateNotEqualFractionDateZeroSeconds()) {
      this.buildFractionBeforeDate();

      if (
        this.fraction.tsForOption ===
          common.FractionTsForOptionEnum.ForInfinity ||
        this.forValueForm.valid
      ) {
        this.emitFractionUpdate();
      }
    }
  }

  afterOpenClose() {
    if (this.isDateNotEqualFractionDateZeroSeconds()) {
      this.buildFractionAfterDate();

      if (
        this.fraction.tsForOption ===
          common.FractionTsForOptionEnum.ForInfinity ||
        this.forValueForm.valid
      ) {
        this.emitFractionUpdate();
      }
    }
  }

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }

  relativeValueBlur() {
    let value = this.relativeValueForm.controls['tsRelativeValue'].value;

    if (value !== this.fraction.tsRelativeValue) {
      this.fraction.tsRelativeValue = Number(value);
      this.buildRelative();
    }
  }

  relativeTsUnitOptionChange() {
    let value = this.tsRelativeUnitForm.controls['tsRelativeUnit'].value;

    if (value !== this.fraction.tsRelativeUnit) {
      this.fraction.tsRelativeUnit = value;
      this.buildRelative();
    }
  }

  relativeTsCompleteOptionChange() {
    let value = this.tsRelativeCompleteForm.controls['tsRelativeCompleteOption']
      .value;

    if (value !== this.fraction.tsRelativeCompleteOption) {
      this.fraction.tsRelativeCompleteOption = value;
      this.buildRelative();
    }
  }

  relativeTsWhenOptionChange() {
    let value = this.tsRelativeWhenForm.controls['tsRelativeWhenOption'].value;

    if (value !== this.fraction.tsRelativeWhenOption) {
      this.fraction.tsRelativeWhenOption = value;
      this.buildRelative();
    }
  }

  tsForOptionChange() {
    let value = this.tsForForm.controls['tsForOption'].value;

    if (value === common.FractionTsForOptionEnum.For) {
      this.fraction = Object.assign({}, this.fraction, {
        tsForOption: value,
        tsForValue: 1,
        tsForUnit: common.FractionTsForUnitEnum.Weeks
      });
    } else if (value === common.FractionTsForOptionEnum.ForInfinity) {
      this.fraction = Object.assign({}, this.fraction, {
        tsForOption: value,
        tsForValue: 1,
        tsForUnit: common.FractionTsForUnitEnum.Weeks
      });
    }

    this.updateForControls();
    this.buildFor();
  }

  forValueBlur() {
    let value = this.forValueForm.controls['tsForValue'].value;

    if (value !== this.fraction.tsForValue) {
      this.fraction.tsForValue = Number(value);
      this.buildFor();
    }
  }

  tsForUnitChange() {
    let value = this.tsForUnitForm.controls['tsForUnit'].value;

    this.fraction = Object.assign({}, this.fraction, {
      tsForUnit: value
    });

    this.updateForControls();
    this.buildFor();
  }

  buildRelative() {
    if (this.fraction.type === common.FractionTypeEnum.TsIsBeforeRelative) {
      this.buildFractionBeforeRelative();
    } else if (
      this.fraction.type === common.FractionTypeEnum.TsIsAfterRelative
    ) {
      this.buildFractionAfterRelative();
    }

    if (
      this.relativeValueForm.valid &&
      (this.fraction.tsForOption ===
        common.FractionTsForOptionEnum.ForInfinity ||
        this.forValueForm.valid)
    ) {
      this.emitFractionUpdate();
    }
  }

  buildFor() {
    if (this.fraction.type === common.FractionTypeEnum.TsIsBeforeDate) {
      this.buildFractionBeforeDate();
    }

    if (this.fraction.type === common.FractionTypeEnum.TsIsAfterDate) {
      this.buildFractionAfterDate();
    }

    if (this.fraction.type === common.FractionTypeEnum.TsIsBeforeRelative) {
      this.buildFractionBeforeRelative();
    }
    if (this.fraction.type === common.FractionTypeEnum.TsIsAfterRelative) {
      this.buildFractionAfterRelative();
    }

    if (
      ([
        common.FractionTypeEnum.TsIsBeforeRelative,
        common.FractionTypeEnum.TsIsAfterRelative
      ].indexOf(this.fraction.type) < 0 ||
        this.relativeValueForm.valid) &&
      (this.fraction.tsForOption ===
        common.FractionTsForOptionEnum.ForInfinity ||
        this.forValueForm.valid)
    ) {
      this.emitFractionUpdate();
    }
  }
}
