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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Moment } from 'moment';
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

  date: Moment;
  dateTo: Moment;

  fractionTypeForm: FormGroup;

  forValueForm: FormGroup;
  relativeValueForm: FormGroup;
  lastValueForm: FormGroup;

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

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildFractionTypeForm();

    this.resetDateUsingFraction();
    this.resetDateToUsingFraction();

    this.buildForValueForm();
    this.buildRelativeValueForm();
    this.buildLastValueForm();
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

  ngOnChanges(changes: SimpleChanges): void {
    this.resetDateUsingFraction();
    this.resetDateToUsingFraction();
  }

  resetDateUsingFraction() {
    let dateNow = moment();

    this.date = moment({
      year: this.fraction.tsDateYear || dateNow.year(),
      month: this.fraction.tsDateMonth ? this.fraction.tsDateMonth - 1 : 0,
      day: this.fraction.tsDateDay ? this.fraction.tsDateDay : 1,
      hour: this.fraction.tsDateHour ? this.fraction.tsDateHour : 0,
      minute: this.fraction.tsDateMinute ? this.fraction.tsDateMinute : 0,
      second: 0,
      millisecond: 0
    });
  }

  resetDateToUsingFraction() {
    let dateNow = moment();

    this.dateTo = moment({
      year: this.fraction.tsDateToYear || dateNow.year(),
      month: this.fraction.tsDateToMonth ? this.fraction.tsDateToMonth - 1 : 0,
      day: this.fraction.tsDateToDay ? this.fraction.tsDateToDay : 1,
      hour: this.fraction.tsDateToHour ? this.fraction.tsDateToHour : 0,
      minute: this.fraction.tsDateToMinute ? this.fraction.tsDateToMinute : 0,
      second: 0,
      millisecond: 0
    });
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
        this.fraction = {
          brick: `on ${this.getYearString(this.date)}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          tsDateYear: this.date.year()
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnMonth: {
        this.fraction = {
          brick: `on ${this.getMonthString(this.date)}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          tsDateYear: this.date.year(),
          tsDateMonth: this.date.month() + 1
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnDay: {
        this.fraction = {
          brick: `on ${this.getDayString(this.date)}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          tsDateYear: this.date.year(),
          tsDateMonth: this.date.month() + 1,
          tsDateDay: this.date.date()
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnHour: {
        this.fraction = {
          brick: `on ${this.getHourString(this.date)}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          tsDateYear: this.date.year(),
          tsDateMonth: this.date.month() + 1,
          tsDateDay: this.date.date(),
          tsDateHour: this.date.hour()
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnMinute: {
        this.buildFractionMinute();

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

  buildFractionMinute() {
    this.fraction = {
      brick: `on ${this.getMinuteString(this.date)}`,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsOnMinute,
      tsDateYear: this.date.year(),
      tsDateMonth: this.date.month() + 1,
      tsDateDay: this.date.date(),
      tsDateHour: this.date.hour(),
      tsDateMinute: this.date.minute()
    };
  }

  buildFractionRange() {
    this.fraction = {
      brick: `on ${this.getMinuteString(this.date)} to ${this.getMinuteString(
        this.dateTo
      )}`,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsInRange,
      tsDateYear: this.date.year(),
      tsDateMonth: this.date.month() + 1,
      tsDateDay: this.date.date(),
      tsDateHour: this.date.hour(),
      tsDateMinute: this.date.minute(),

      tsDateToYear: this.dateTo.year(),
      tsDateToMonth: this.dateTo.month() + 1,
      tsDateToDay: this.dateTo.date(),
      tsDateToHour: this.dateTo.hour(),
      tsDateToMinute: this.dateTo.minute()
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
      tsDateYear: this.date.year(),
      tsDateMonth: this.date.month() + 1,
      tsDateDay: this.date.date(),
      tsDateHour: this.date.hour(),
      tsDateMinute: this.date.minute(),

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
      tsDateYear: this.date.year(),
      tsDateMonth: this.date.month() + 1,
      tsDateDay: this.date.date(),
      tsDateHour: this.date.hour(),
      tsDateMinute: this.date.minute(),

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

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }
}
