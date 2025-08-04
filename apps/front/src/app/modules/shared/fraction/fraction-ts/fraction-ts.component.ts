import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import '@vaadin/date-picker';
import {
  DatePicker,
  DatePickerDate,
  DatePickerI18n
} from '@vaadin/date-picker';
import '@vaadin/time-picker';
import { TimePicker } from '@vaadin/time-picker';
import { COMMON_I18N } from '~front/app/constants/top';
import { StructQuery } from '~front/app/queries/struct.query';
import { TimeService } from '~front/app/services/time.service';
import { ValidationService } from '~front/app/services/validation.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import {
  FractionTsLastCompleteOptionItem,
  FractionTsMixUnitItem,
  FractionTsMomentTypesItem,
  FractionTsUnitItem,
  FractionTypeItem
} from '../fraction.component';

@Component({
  standalone: false,
  selector: 'm-fraction-ts',
  templateUrl: 'fraction-ts.component.html',
  styleUrls: ['fraction-ts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionTsComponent implements OnInit, OnChanges {
  @ViewChild('fractionTsTypeSelect', { static: false })
  fractionTsTypeSelectElement: NgSelectComponent;

  @ViewChild('fractionTsMomentTypeSelect', { static: false })
  fractionTsMomentTypeSelectElement: NgSelectComponent;

  @ViewChild('tsMomentDayOfWeekSelect', { static: false })
  tsMomentDayOfWeekSelectElement: NgSelectComponent;

  @ViewChild('tsMomentOnUnitSelect', { static: false })
  tsMomentOnUnitSelectElement: NgSelectComponent;

  @ViewChild('tsMomentAgoFromNowUnitSelect', { static: false })
  tsMomentAgoFromNowUnitSelectElement: NgSelectComponent;

  @ViewChild('fractionTsFromMomentTypeSelect', { static: false })
  fractionTsFromMomentTypeSelectElement: NgSelectComponent;

  @ViewChild('fractionTsToMomentTypeSelect', { static: false })
  fractionTsToMomentTypeSelectElement: NgSelectComponent;

  @ViewChild('tsForUnitsSelect', { static: false })
  tsForUnitsSelectElement: NgSelectComponent;

  @ViewChild('tsLastUnitsSelect', { static: false })
  tsLastUnitsSelectElement: NgSelectComponent;

  @ViewChild('tsLastCompleteOptionsSelect', { static: false })
  tsLastCompleteOptionsSelectElement: NgSelectComponent;

  @ViewChild('tsNextUnitsSelect', { static: false })
  tsNextUnitsSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionTsTypeSelectElement?.close();
    this.fractionTsMomentTypeSelectElement?.close();
    this.tsMomentDayOfWeekSelectElement?.close();
    this.tsMomentOnUnitSelectElement?.close();
    this.tsMomentAgoFromNowUnitSelectElement?.close();
    this.fractionTsFromMomentTypeSelectElement?.close();
    this.fractionTsToMomentTypeSelectElement?.close();
    this.tsForUnitsSelectElement?.close();
    this.tsLastUnitsSelectElement?.close();
    this.tsLastCompleteOptionsSelectElement?.close();
    this.tsNextUnitsSelectElement?.close();
  }

  fractionOperatorEnum = common.FractionOperatorEnum;
  fractionTypeEnum = common.FractionTypeEnum;
  fractionTsMomentTypeEnum = common.FractionTsMomentTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;
  @Input() isMetrics: boolean;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  @ViewChild('datePickerOnYear') datePickerOnYear: ElementRef<DatePicker>;
  @ViewChild('datePickerOnQuarter') datePickerOnQuarter: ElementRef<DatePicker>;
  @ViewChild('datePickerOnMonth') datePickerOnMonth: ElementRef<DatePicker>;
  @ViewChild('datePickerOnWeek') datePickerOnWeek: ElementRef<DatePicker>;
  @ViewChild('datePickerOnDay') datePickerOnDay: ElementRef<DatePicker>;

  @ViewChild('datePickerOnHour') datePickerOnHour: ElementRef<DatePicker>;
  @ViewChild('timePickerOnHour') timePickerOnHour: ElementRef<TimePicker>;

  @ViewChild('datePickerOnMinute') datePickerOnMinute: ElementRef<DatePicker>;
  @ViewChild('timePickerOnMinute') timePickerOnMinute: ElementRef<TimePicker>;

  @ViewChild('datePickerBefore') datePickerBefore: ElementRef<DatePicker>;
  @ViewChild('timePickerBefore') timePickerBefore: ElementRef<TimePicker>;

  @ViewChild('timePickerThrough') timePickerThrough: ElementRef<TimePicker>;
  @ViewChild('datePickerThrough') datePickerThrough: ElementRef<DatePicker>;

  @ViewChild('datePickerAfter') datePickerAfter: ElementRef<DatePicker>;
  @ViewChild('timePickerAfter') timePickerAfter: ElementRef<TimePicker>;

  @ViewChild('timePickerStarting') timePickerStarting: ElementRef<TimePicker>;
  @ViewChild('datePickerStarting') datePickerStarting: ElementRef<DatePicker>;

  @ViewChild('timePickerBeginFor') timePickerBeginFor: ElementRef<TimePicker>;
  @ViewChild('datePickerBeginFor') datePickerBeginFor: ElementRef<DatePicker>;

  @ViewChild('datePickerBetweenFrom')
  datePickerBetweenFrom: ElementRef<DatePicker>;
  @ViewChild('timePickerBetweenFrom')
  timePickerBetweenFrom: ElementRef<TimePicker>;

  @ViewChild('datePickerBetweenTo') datePickerBetweenTo: ElementRef<DatePicker>;
  @ViewChild('timePickerBetweenTo') timePickerBetweenTo: ElementRef<TimePicker>;

  tsForValueForm: FormGroup;
  tsLastValueForm: FormGroup;
  tsNextValueForm: FormGroup;

  tsTimestampValueForm: FormGroup;
  tsFromTimestampValueForm: FormGroup;
  tsToTimestampValueForm: FormGroup;

  tsMomentAgoFromNowQuantityForm: FormGroup;
  tsFromMomentAgoFromNowQuantityForm: FormGroup;
  tsToMomentAgoFromNowQuantityForm: FormGroup;

  fractionTsTypesList: FractionTypeItem[] = [];
  fractionTsTypesFullList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: common.FractionTypeEnum.TsIsAnyValue,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is in last',
      value: common.FractionTypeEnum.TsIsInLast,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is on Day',
      value: common.FractionTypeEnum.TsIsOnDay,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is on Week',
      value: common.FractionTypeEnum.TsIsOnWeek,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is on Month',
      value: common.FractionTypeEnum.TsIsOnMonth,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is on Quarter',
      value: common.FractionTypeEnum.TsIsOnQuarter,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is on Year',
      value: common.FractionTypeEnum.TsIsOnYear,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is in next',
      value: common.FractionTypeEnum.TsIsInNext,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is after',
      value: common.FractionTypeEnum.TsIsAfter,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is starting at',
      value: common.FractionTypeEnum.TsIsStarting,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is beginning at',
      value: common.FractionTypeEnum.TsIsBeginFor,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is between',
      value: common.FractionTypeEnum.TsIsBetween,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is before',
      value: common.FractionTypeEnum.TsIsBefore,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is through',
      value: common.FractionTypeEnum.TsIsThrough,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is on Hour',
      value: common.FractionTypeEnum.TsIsOnHour,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is on Minute',
      value: common.FractionTypeEnum.TsIsOnMinute,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is on Timestamp',
      value: common.FractionTypeEnum.TsIsOnTimestamp,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is null',
      value: common.FractionTypeEnum.TsIsNull,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is not in last',
      value: common.FractionTypeEnum.TsIsNotInLast,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not in next',
      value: common.FractionTypeEnum.TsIsNotInNext,
      operator: common.FractionOperatorEnum.And
    },
    // {
    //   label: 'is not after',
    //   value: common.FractionTypeEnum.TsIsNotAfter, // is through
    //   operator: common.FractionOperatorEnum.And
    // },
    // {
    //   label: 'is not starting at',
    //   value: common.FractionTypeEnum.TsIsNotStarting, // is before // not supported (malloy issue)
    //   operator: common.FractionOperatorEnum.And
    // },
    {
      label: 'is not beginning at',
      value: common.FractionTypeEnum.TsIsNotBeginFor,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not on Day',
      value: common.FractionTypeEnum.TsIsNotOnDay,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not on Week',
      value: common.FractionTypeEnum.TsIsNotOnWeek,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not on Month',
      value: common.FractionTypeEnum.TsIsNotOnMonth,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not on Quarter',
      value: common.FractionTypeEnum.TsIsNotOnQuarter,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not on Year',
      value: common.FractionTypeEnum.TsIsNotOnYear,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not between',
      value: common.FractionTypeEnum.TsIsNotBetween,
      operator: common.FractionOperatorEnum.And
    },
    // {
    //   label: 'is not before',
    //   value: common.FractionTypeEnum.TsIsNotBefore, // is starting
    //   operator: common.FractionOperatorEnum.And
    // },
    // {
    //   label: 'is not through',
    //   value: common.FractionTypeEnum.TsIsNotThrough, // is after // not supported (malloy issue)
    //   operator: common.FractionOperatorEnum.And
    // },
    {
      label: 'is not on Hour',
      value: common.FractionTypeEnum.TsIsNotOnHour,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not on Minute',
      value: common.FractionTypeEnum.TsIsNotOnMinute,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not on Timestamp',
      value: common.FractionTypeEnum.TsIsNotOnTimestamp,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not null',
      value: common.FractionTypeEnum.TsIsNotNull,
      operator: common.FractionOperatorEnum.And
    }
  ];

  fractionTsMomentTypesList: FractionTsMomentTypesItem[] = [];
  fractionTsMomentTypesFullList: FractionTsMomentTypesItem[] = [
    {
      label: 'calendar',
      value: common.FractionTsMomentTypeEnum.Literal
    },
    {
      label: 'today',
      value: common.FractionTsMomentTypeEnum.Today
    },
    {
      label: 'yesterday',
      value: common.FractionTsMomentTypeEnum.Yesterday
    },
    {
      label: 'tomorrow',
      value: common.FractionTsMomentTypeEnum.Tomorrow
    },
    {
      label: 'this',
      value: common.FractionTsMomentTypeEnum.This
    },
    {
      label: 'last',
      value: common.FractionTsMomentTypeEnum.Last
    },
    {
      label: 'next',
      value: common.FractionTsMomentTypeEnum.Next
    },
    {
      label: 'ago',
      value: common.FractionTsMomentTypeEnum.Ago
    },
    {
      label: 'from now',
      value: common.FractionTsMomentTypeEnum.FromNow
    },
    {
      label: 'now',
      value: common.FractionTsMomentTypeEnum.Now
    },
    {
      label: 'timestamp',
      value: common.FractionTsMomentTypeEnum.Timestamp
    }
  ];

  fractionTsOnUnitsList: FractionTsMixUnitItem[] = [];
  fractionTsAgoFromNowUnitsList: FractionTsMixUnitItem[] = [];
  fractionTsOnDayUnitsList: FractionTsMixUnitItem[] = [];
  fractionTsLiteralUnitsList: FractionTsMixUnitItem[] = [];

  fractionTsMixUnitsTempList: FractionTsMixUnitItem[] = [
    {
      label: 'day',
      value: common.FractionTsMixUnitEnum.Day
    },
    {
      label: 'week',
      value: common.FractionTsMixUnitEnum.Week
    },
    {
      label: 'month',
      value: common.FractionTsMixUnitEnum.Month
    },
    {
      label: 'quarter',
      value: common.FractionTsMixUnitEnum.Quarter
    },
    {
      label: 'year',
      value: common.FractionTsMixUnitEnum.Year
    },
    {
      label: 'hour',
      value: common.FractionTsMixUnitEnum.Hour
    },
    {
      label: 'minute',
      value: common.FractionTsMixUnitEnum.Minute
    },
    {
      label: 'second',
      value: common.FractionTsMixUnitEnum.Second
    }
  ];

  fractionTsMixUnitsDayOfWeekSundayList: FractionTsMixUnitItem[] = [
    {
      label: 'Sunday',
      value: common.FractionTsMixUnitEnum.Sunday
    },
    {
      label: 'Monday',
      value: common.FractionTsMixUnitEnum.Monday
    },
    {
      label: 'Tuesday',
      value: common.FractionTsMixUnitEnum.Tuesday
    },
    {
      label: 'Wednesday',
      value: common.FractionTsMixUnitEnum.Wednesday
    },
    {
      label: 'Thursday',
      value: common.FractionTsMixUnitEnum.Thursday
    },
    {
      label: 'Friday',
      value: common.FractionTsMixUnitEnum.Friday
    },
    {
      label: 'Saturday',
      value: common.FractionTsMixUnitEnum.Saturday
    }
  ];

  fractionTsMixUnitsDayOfWeekMondayList: FractionTsMixUnitItem[] = [
    {
      label: 'Monday',
      value: common.FractionTsMixUnitEnum.Monday
    },
    {
      label: 'Tuesday',
      value: common.FractionTsMixUnitEnum.Tuesday
    },
    {
      label: 'Wednesday',
      value: common.FractionTsMixUnitEnum.Wednesday
    },
    {
      label: 'Thursday',
      value: common.FractionTsMixUnitEnum.Thursday
    },
    {
      label: 'Friday',
      value: common.FractionTsMixUnitEnum.Friday
    },
    {
      label: 'Saturday',
      value: common.FractionTsMixUnitEnum.Saturday
    },
    {
      label: 'Sunday',
      value: common.FractionTsMixUnitEnum.Sunday
    }
  ];

  fractionTsLastNextUnitsList: FractionTsUnitItem[] = [];
  fractionTsForUnitsList: FractionTsUnitItem[] = [];
  fractionTsUnitsFullList: FractionTsUnitItem[] = [
    {
      label: 'days',
      value: common.FractionTsUnitEnum.Days
    },
    {
      label: 'weeks',
      value: common.FractionTsUnitEnum.Weeks
    },
    {
      label: 'months',
      value: common.FractionTsUnitEnum.Months
    },
    {
      label: 'quarters',
      value: common.FractionTsUnitEnum.Quarters
    },
    {
      label: 'years',
      value: common.FractionTsUnitEnum.Years
    },
    {
      label: 'hours',
      value: common.FractionTsUnitEnum.Hours
    },
    {
      label: 'minutes',
      value: common.FractionTsUnitEnum.Minutes
    },
    {
      label: 'seconds',
      value: common.FractionTsUnitEnum.Seconds
    }
  ];

  fractionTsLastCompleteOptionsList: FractionTsLastCompleteOptionItem[] = [
    {
      label: 'completed with current',
      value: common.FractionTsLastCompleteOptionEnum.CompleteWithCurrent
    },
    {
      label: 'completed',
      value: common.FractionTsLastCompleteOptionEnum.Complete
    }
  ];

  commonI18n: DatePickerI18n = COMMON_I18N;

  onYearDateI18n = Object.assign({}, this.commonI18n, {
    formatDate: (d: DatePickerDate) => `${d.year}`
  });
  onQuarterDateI18n = Object.assign({}, this.commonI18n, {
    formatDate: (d: DatePickerDate) => {
      let monthIndex = d.month + 1;
      let month =
        monthIndex.toString().length === 1 ? `0${monthIndex}` : `${monthIndex}`;

      let quarter =
        [1, 2, 3].indexOf(Number(month)) > -1
          ? '1'
          : [4, 5, 6].indexOf(Number(month)) > -1
            ? '2'
            : [7, 8, 9].indexOf(Number(month)) > -1
              ? '3'
              : [10, 11, 12].indexOf(Number(month)) > -1
                ? '4'
                : undefined;

      return `${d.year}-Q${quarter}`;
    }
  });
  onMonthDateI18n = Object.assign({}, this.commonI18n, {
    formatDate: (d: DatePickerDate) => {
      let monthIndex = d.month + 1;
      let month =
        monthIndex.toString().length === 1 ? `0${monthIndex}` : `${monthIndex}`;

      return `${d.year}-${month}`;
    }
  });
  onWeekDateI18n = Object.assign({}, this.commonI18n, {
    formatDate: (d: DatePickerDate) => {
      let monthIndex = d.month + 1;
      let month =
        monthIndex.toString().length === 1 ? `0${monthIndex}` : `${monthIndex}`;

      let day = d.day.toString().length === 1 ? `0${d.day}` : `${d.day}`;

      return `${d.year}-${month}-${day}-WK`;
    }
  });
  onDayDateI18n = Object.assign({}, this.commonI18n);
  onHourDateI18n = Object.assign({}, this.commonI18n);
  onMinuteDateI18n = Object.assign({}, this.commonI18n);
  beforeI18n = Object.assign({}, this.commonI18n, {
    formatDate: (d: DatePickerDate) =>
      this.timeService.momentFormatDate({
        d: d,
        momentUnit: this.fraction.tsMomentUnit
      })
  });
  throughI18n = Object.assign({}, this.commonI18n, {
    formatDate: (d: DatePickerDate) =>
      this.timeService.momentFormatDate({
        d: d,
        momentUnit: this.fraction.tsMomentUnit
      })
  });
  afterI18n = Object.assign({}, this.commonI18n, {
    formatDate: (d: DatePickerDate) =>
      this.timeService.momentFormatDate({
        d: d,
        momentUnit: this.fraction.tsMomentUnit
      })
  });
  startingI18n = Object.assign({}, this.commonI18n, {
    formatDate: (d: DatePickerDate) =>
      this.timeService.momentFormatDate({
        d: d,
        momentUnit: this.fraction.tsMomentUnit
      })
  });
  beginForI18n = Object.assign({}, this.commonI18n, {
    formatDate: (d: DatePickerDate) =>
      this.timeService.momentFormatDate({
        d: d,
        momentUnit: this.fraction.tsMomentUnit
      })
  });
  betweenFromDateI18n = Object.assign({}, this.commonI18n, {
    formatDate: (d: DatePickerDate) =>
      this.timeService.momentFormatDate({
        d: d,
        momentUnit: this.fraction.tsFromMomentUnit
      })
  });
  betweenToDateI18n = Object.assign({}, this.commonI18n, {
    formatDate: (d: DatePickerDate) =>
      this.timeService.momentFormatDate({
        d: d,
        momentUnit: this.fraction.tsToMomentUnit
      })
  });

  dateStr: string;
  dateToStr: string;

  timeStr: string;
  timeToStr: string;

  constructor(
    private fb: FormBuilder,
    private structQuery: StructQuery,
    private timeService: TimeService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fractionTsTypesList =
      this.isMetrics === false
        ? this.fractionTsTypesFullList
        : this.fractionTsTypesFullList.filter(
            x =>
              [
                common.FractionTypeEnum.TsIsInLast,
                common.FractionTypeEnum.TsIsOnDay,
                common.FractionTypeEnum.TsIsOnWeek,
                common.FractionTypeEnum.TsIsOnMonth,
                common.FractionTypeEnum.TsIsOnQuarter,
                common.FractionTypeEnum.TsIsOnYear,
                common.FractionTypeEnum.TsIsInNext,
                common.FractionTypeEnum.TsIsAfter,
                common.FractionTypeEnum.TsIsStarting,
                common.FractionTypeEnum.TsIsBeginFor,
                common.FractionTypeEnum.TsIsBetween,
                common.FractionTypeEnum.TsIsBefore,
                common.FractionTypeEnum.TsIsThrough,
                common.FractionTypeEnum.TsIsOnHour,
                common.FractionTypeEnum.TsIsOnMinute,
                common.FractionTypeEnum.TsIsOnTimestamp,
                common.FractionTypeEnum.TsIsNotInLast,
                common.FractionTypeEnum.TsIsNotOnDay,
                common.FractionTypeEnum.TsIsNotOnWeek,
                common.FractionTypeEnum.TsIsNotOnMonth,
                common.FractionTypeEnum.TsIsNotOnQuarter,
                common.FractionTypeEnum.TsIsNotOnYear,
                common.FractionTypeEnum.TsIsNotInNext,
                common.FractionTypeEnum.TsIsNotBeginFor,
                common.FractionTypeEnum.TsIsNotBetween,
                common.FractionTypeEnum.TsIsNotOnHour,
                common.FractionTypeEnum.TsIsNotOnMinute,
                common.FractionTypeEnum.TsIsNotOnTimestamp
              ].indexOf(x.value) > -1
          );

    let structState = this.structQuery.getValue();

    let dowMixList =
      structState.weekStart === common.ProjectWeekStartEnum.Monday
        ? this.fractionTsMixUnitsDayOfWeekMondayList
        : this.fractionTsMixUnitsDayOfWeekSundayList;

    this.fractionTsOnUnitsList = [
      ...this.fractionTsMixUnitsTempList,
      ...dowMixList
    ];

    this.fractionTsOnDayUnitsList = [
      ...this.fractionTsMixUnitsTempList.filter(
        x => x.value === common.FractionTsMixUnitEnum.Day
      ),
      ...dowMixList
    ];

    this.fractionTsLiteralUnitsList = [
      ...this.fractionTsMixUnitsTempList.filter(
        x => x.value !== common.FractionTsMixUnitEnum.Second
      )
    ];

    this.fractionTsAgoFromNowUnitsList = this.fractionTsMixUnitsTempList;

    this.fractionTsLastNextUnitsList = this.fractionTsUnitsFullList;
    this.fractionTsForUnitsList = this.fractionTsUnitsFullList;

    this.resetDates({ useFraction: true });

    this.buildForValueForm();
    this.buildLastValueForm();
    this.buildNextValueForm();

    this.buildTimestampValueForm();
    this.buildFromTimestampValueForm();
    this.buildToTimestampValueForm();

    this.buildMomentAgoFromNowQuantityForm();
    this.buildFromMomentAgoFromNowQuantityForm();
    this.buildToMomentAgoFromNowQuantityForm();

    let firstDayOfWeek =
      structState.weekStart === common.ProjectWeekStartEnum.Monday ? 1 : 0;

    this.onYearDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onQuarterDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onMonthDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onWeekDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onDayDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onHourDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onMinuteDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.beforeI18n.firstDayOfWeek = firstDayOfWeek;
    this.afterI18n.firstDayOfWeek = firstDayOfWeek;
    this.betweenFromDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.betweenToDateI18n.firstDayOfWeek = firstDayOfWeek;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (common.isDefined(changes.fraction)) {
      if (
        [
          common.FractionTypeEnum.TsIsOnYear,
          common.FractionTypeEnum.TsIsOnQuarter,
          common.FractionTypeEnum.TsIsOnMonth,
          common.FractionTypeEnum.TsIsOnWeek,
          common.FractionTypeEnum.TsIsOnHour,
          common.FractionTypeEnum.TsIsOnMinute,
          common.FractionTypeEnum.TsIsNotOnYear,
          common.FractionTypeEnum.TsIsNotOnQuarter,
          common.FractionTypeEnum.TsIsNotOnMonth,
          common.FractionTypeEnum.TsIsNotOnWeek,
          common.FractionTypeEnum.TsIsNotOnHour,
          common.FractionTypeEnum.TsIsNotOnMinute
        ].indexOf((changes.fraction.currentValue as common.Fraction).type) > -1
      ) {
        this.fractionTsMomentTypesList =
          this.fractionTsMomentTypesFullList.filter(
            x =>
              [
                common.FractionTsMomentTypeEnum.Literal,
                common.FractionTsMomentTypeEnum.This,
                common.FractionTsMomentTypeEnum.Last,
                common.FractionTsMomentTypeEnum.Next,
                common.FractionTsMomentTypeEnum.Ago,
                common.FractionTsMomentTypeEnum.FromNow
              ].indexOf(x.value) > -1
          );
      } else if (
        [
          common.FractionTypeEnum.TsIsOnDay,
          common.FractionTypeEnum.TsIsNotOnDay
        ].indexOf((changes.fraction.currentValue as common.Fraction).type) > -1
      ) {
        this.fractionTsMomentTypesList =
          this.fractionTsMomentTypesFullList.filter(
            x =>
              [
                common.FractionTsMomentTypeEnum.Literal,
                common.FractionTsMomentTypeEnum.Today,
                common.FractionTsMomentTypeEnum.Yesterday,
                common.FractionTsMomentTypeEnum.Tomorrow,
                common.FractionTsMomentTypeEnum.This,
                common.FractionTsMomentTypeEnum.Last,
                common.FractionTsMomentTypeEnum.Next,
                common.FractionTsMomentTypeEnum.Ago,
                common.FractionTsMomentTypeEnum.FromNow
              ].indexOf(x.value) > -1
          );
      } else if (
        [
          common.FractionTypeEnum.TsIsOnTimestamp,
          common.FractionTypeEnum.TsIsNotOnTimestamp
        ].indexOf((changes.fraction.currentValue as common.Fraction).type) > -1
      ) {
        this.fractionTsMomentTypesList =
          this.fractionTsMomentTypesFullList.filter(
            x =>
              [
                common.FractionTsMomentTypeEnum.Timestamp,
                common.FractionTsMomentTypeEnum.Now
              ].indexOf(x.value) > -1
          );
      } else if (
        [
          common.FractionTypeEnum.TsIsBefore,
          common.FractionTypeEnum.TsIsThrough,
          common.FractionTypeEnum.TsIsAfter,
          common.FractionTypeEnum.TsIsStarting,
          common.FractionTypeEnum.TsIsBeginFor,
          common.FractionTypeEnum.TsIsNotBeginFor
        ].indexOf((changes.fraction.currentValue as common.Fraction).type) > -1
      ) {
        this.fractionTsMomentTypesList =
          this.fractionTsMomentTypesFullList.filter(
            x =>
              [
                common.FractionTsMomentTypeEnum.Literal,
                common.FractionTsMomentTypeEnum.Today,
                common.FractionTsMomentTypeEnum.Yesterday,
                common.FractionTsMomentTypeEnum.Tomorrow,
                common.FractionTsMomentTypeEnum.This,
                common.FractionTsMomentTypeEnum.Last,
                common.FractionTsMomentTypeEnum.Next,
                common.FractionTsMomentTypeEnum.Ago,
                common.FractionTsMomentTypeEnum.FromNow,
                common.FractionTsMomentTypeEnum.Now,
                common.FractionTsMomentTypeEnum.Timestamp
              ].indexOf(x.value) > -1
          );
      } else {
        this.fractionTsMomentTypesList = this.fractionTsMomentTypesFullList;
      }
    }
  }

  buildForValueForm() {
    this.tsForValueForm = this.fb.group({
      tsForValue: [
        this.fraction.tsForValue,
        [
          Validators.required,
          ValidationService.zeroToThreeDigitsIntegerOrEmptyValidator,
          Validators.min(0)
        ]
      ]
    });
  }

  buildLastValueForm() {
    this.tsLastValueForm = this.fb.group({
      tsLastValue: [
        this.fraction.tsLastValue,
        [
          Validators.required,
          ValidationService.zeroToThreeDigitsIntegerOrEmptyValidator,
          Validators.min(0)
        ]
      ]
    });
  }

  buildNextValueForm() {
    this.tsNextValueForm = this.fb.group({
      tsNextValue: [
        this.fraction.tsNextValue,
        [
          Validators.required,
          ValidationService.zeroToThreeDigitsIntegerOrEmptyValidator,
          Validators.min(0)
        ]
      ]
    });
  }

  buildTimestampValueForm() {
    this.tsTimestampValueForm = this.fb.group({
      tsTimestampValue: [
        this.fraction.tsTimestampValue,
        [Validators.required, ValidationService.timestampValidator]
      ]
    });
  }

  buildFromTimestampValueForm() {
    this.tsFromTimestampValueForm = this.fb.group({
      tsFromTimestampValue: [
        this.fraction.tsFromTimestampValue,
        [Validators.required, ValidationService.timestampValidator]
      ]
    });
  }

  buildToTimestampValueForm() {
    this.tsToTimestampValueForm = this.fb.group({
      tsToTimestampValue: [
        this.fraction.tsToTimestampValue,
        [Validators.required, ValidationService.timestampValidator]
      ]
    });
  }

  buildMomentAgoFromNowQuantityForm() {
    this.tsMomentAgoFromNowQuantityForm = this.fb.group({
      tsMomentAgoFromNowQuantity: [
        this.fraction.tsMomentAgoFromNowQuantity,
        [
          Validators.required,
          ValidationService.zeroToThreeDigitsIntegerOrEmptyValidator,
          Validators.min(0)
        ]
      ]
    });
  }

  buildFromMomentAgoFromNowQuantityForm() {
    this.tsFromMomentAgoFromNowQuantityForm = this.fb.group({
      tsFromMomentAgoFromNowQuantity: [
        this.fraction.tsFromMomentAgoFromNowQuantity,
        [
          Validators.required,
          ValidationService.zeroToThreeDigitsIntegerOrEmptyValidator,
          Validators.min(0)
        ]
      ]
    });
  }

  buildToMomentAgoFromNowQuantityForm() {
    this.tsToMomentAgoFromNowQuantityForm = this.fb.group({
      tsToMomentAgoFromNowQuantity: [
        this.fraction.tsToMomentAgoFromNowQuantity,
        [
          Validators.required,
          ValidationService.zeroToThreeDigitsIntegerOrEmptyValidator,
          Validators.min(0)
        ]
      ]
    });
  }

  resetDates(item: { useFraction: boolean }) {
    this.resetDateUsingFraction({ useFraction: item.useFraction });
    this.resetDateToUsingFraction({ useFraction: item.useFraction });
  }

  resetDateUsingFraction(item: { useFraction: boolean }) {
    let { useFraction } = item;

    let useNow =
      useFraction === false ||
      (common.isUndefined(this.fraction.tsDateYear) &&
        common.isUndefined(this.fraction.tsDateQuarter) &&
        common.isUndefined(this.fraction.tsDateMonth) &&
        common.isUndefined(this.fraction.tsDateDay) &&
        common.isUndefined(this.fraction.tsDateHour) &&
        common.isUndefined(this.fraction.tsDateMinute));

    let now = new Date();

    let year =
      useNow === true
        ? now.getFullYear()
        : useFraction === true && common.isDefined(this.fraction.tsDateYear)
          ? this.fraction.tsDateYear
          : 2020;

    let month =
      useNow === true
        ? now.getMonth() + 1
        : useFraction === true &&
            common.isUndefined(this.fraction.tsDateMonth) &&
            common.isDefined(this.fraction.tsDateQuarter)
          ? this.fraction.tsDateQuarter === 1
            ? 1
            : this.fraction.tsDateQuarter === 2
              ? 4
              : this.fraction.tsDateQuarter === 3
                ? 7
                : this.fraction.tsDateQuarter === 4
                  ? 10
                  : undefined
          : useFraction === true && common.isDefined(this.fraction.tsDateMonth)
            ? this.fraction.tsDateMonth
            : 1;

    let day =
      useNow === true
        ? now.getDate()
        : useFraction === true && common.isDefined(this.fraction.tsDateDay)
          ? this.fraction.tsDateDay
          : 1;

    let hour =
      useNow === true
        ? 0
        : useFraction === true && common.isDefined(this.fraction.tsDateHour)
          ? this.fraction.tsDateHour
          : 0;

    let minute =
      useNow === true
        ? 0
        : useFraction === true && common.isDefined(this.fraction.tsDateMinute)
          ? this.fraction.tsDateMinute
          : 0;

    let second = 0;

    let pad = (value: any) => String(value).padStart(2, '0');

    this.dateStr = `${year}-${pad(month)}-${pad(day)}`;
    this.timeStr = `${pad(hour)}:${pad(minute)}:${pad(second)}`;
  }

  resetDateToUsingFraction(item: { useFraction: boolean }) {
    let { useFraction } = item;

    let useNowPlusOneDay =
      useFraction === false ||
      (common.isUndefined(this.fraction.tsDateToYear) &&
        common.isUndefined(this.fraction.tsDateToQuarter) &&
        common.isUndefined(this.fraction.tsDateToMonth) &&
        common.isUndefined(this.fraction.tsDateToDay) &&
        common.isUndefined(this.fraction.tsDateToHour) &&
        common.isUndefined(this.fraction.tsDateToMinute));

    let nowPlusOneDay = new Date();

    nowPlusOneDay.setDate(nowPlusOneDay.getDate() + 1);

    let year =
      useNowPlusOneDay === true
        ? nowPlusOneDay.getFullYear()
        : useFraction === true && common.isDefined(this.fraction.tsDateToYear)
          ? this.fraction.tsDateToYear
          : 2020;

    let month =
      useNowPlusOneDay === true
        ? nowPlusOneDay.getMonth() + 1
        : useFraction === true &&
            common.isUndefined(this.fraction.tsDateToMonth) &&
            common.isDefined(this.fraction.tsDateToQuarter)
          ? this.fraction.tsDateToQuarter === 1
            ? 1
            : this.fraction.tsDateToQuarter === 2
              ? 4
              : this.fraction.tsDateToQuarter === 3
                ? 7
                : this.fraction.tsDateToQuarter === 4
                  ? 10
                  : undefined
          : useFraction === true &&
              common.isDefined(this.fraction.tsDateToMonth)
            ? this.fraction.tsDateToMonth
            : 1;

    let day =
      useNowPlusOneDay === true
        ? nowPlusOneDay.getDate()
        : useFraction === true && common.isDefined(this.fraction.tsDateToDay)
          ? this.fraction.tsDateToDay
          : 1;

    let hour =
      useNowPlusOneDay === true
        ? 0
        : useFraction === true && common.isDefined(this.fraction.tsDateToHour)
          ? this.fraction.tsDateToHour
          : 0;

    let minute =
      useNowPlusOneDay === true
        ? 0
        : useFraction === true && common.isDefined(this.fraction.tsDateToMinute)
          ? this.fraction.tsDateToMinute
          : 0;

    let second = 0;

    let pad = (value: any) => String(value).padStart(2, '0');

    this.dateToStr = `${year}-${pad(month)}-${pad(day)}`;
    this.timeToStr = `${pad(hour)}:${pad(minute)}:${pad(second)}`;
  }

  typeChange(fractionTypeItem: FractionTypeItem) {
    let fractionType = fractionTypeItem.value;

    this.resetDates({ useFraction: false });

    switch (fractionType) {
      case this.fractionTypeEnum.TsIsAnyValue: {
        break;
      }

      case this.fractionTypeEnum.TsIsInLast:
      case this.fractionTypeEnum.TsIsNotInLast: {
        this.fraction.tsLastValue = 5;
        this.fraction.tsLastUnit = common.FractionTsUnitEnum.Days;
        this.fraction.tsLastCompleteOption =
          common.FractionTsLastCompleteOptionEnum.CompleteWithCurrent;
        break;
      }

      case this.fractionTypeEnum.TsIsOnDay:
      case this.fractionTypeEnum.TsIsNotOnDay: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsMomentUnit = common.FractionTsMixUnitEnum.Day;
        break;
      }

      case this.fractionTypeEnum.TsIsOnWeek:
      case this.fractionTypeEnum.TsIsNotOnWeek: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsMomentUnit = common.FractionTsMixUnitEnum.Week;

        this.dateStr = this.timeService.getWeekStartDate({
          dateValue: this.dateStr
        });
        break;
      }

      case this.fractionTypeEnum.TsIsOnMonth:
      case this.fractionTypeEnum.TsIsNotOnMonth: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsMomentUnit = common.FractionTsMixUnitEnum.Month;
        break;
      }

      case this.fractionTypeEnum.TsIsOnQuarter:
      case this.fractionTypeEnum.TsIsNotOnQuarter: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsMomentUnit = common.FractionTsMixUnitEnum.Quarter;

        this.dateStr = this.timeService.getQuarterStartDate({
          dateValue: this.dateStr
        });
        break;
      }

      case this.fractionTypeEnum.TsIsOnYear:
      case this.fractionTypeEnum.TsIsNotOnYear: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsMomentUnit = common.FractionTsMixUnitEnum.Year;
        break;
      }

      case this.fractionTypeEnum.TsIsInNext:
      case this.fractionTypeEnum.TsIsNotInNext: {
        this.fraction.tsNextValue = 5;
        this.fraction.tsNextUnit = common.FractionTsUnitEnum.Days;
        break;
      }

      case this.fractionTypeEnum.TsIsAfter: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsMomentUnit = common.FractionTsMixUnitEnum.Day;
        break;
      }

      case this.fractionTypeEnum.TsIsStarting: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsMomentUnit = common.FractionTsMixUnitEnum.Day;
        break;
      }

      case this.fractionTypeEnum.TsIsBeginFor:
      case this.fractionTypeEnum.TsIsNotBeginFor: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsMomentUnit = common.FractionTsMixUnitEnum.Day;

        this.fraction.tsForValue = 1;
        this.fraction.tsForUnit = common.FractionTsUnitEnum.Weeks;
        break;
      }

      case this.fractionTypeEnum.TsIsBetween:
      case this.fractionTypeEnum.TsIsNotBetween: {
        this.fraction.tsFromMomentType =
          common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsFromMomentAgoFromNowQuantity = 1;
        this.fraction.tsFromMomentUnit = common.FractionTsMixUnitEnum.Day;

        this.fraction.tsToMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsToMomentAgoFromNowQuantity = 1;
        this.fraction.tsToMomentUnit = common.FractionTsMixUnitEnum.Day;
        break;
      }

      case this.fractionTypeEnum.TsIsBefore: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsMomentUnit = common.FractionTsMixUnitEnum.Day;
        break;
      }

      case this.fractionTypeEnum.TsIsThrough: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsMomentUnit = common.FractionTsMixUnitEnum.Day;
        break;
      }

      case this.fractionTypeEnum.TsIsOnHour:
      case this.fractionTypeEnum.TsIsNotOnHour: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsMomentUnit = common.FractionTsMixUnitEnum.Hour;
        break;
      }

      case this.fractionTypeEnum.TsIsOnMinute:
      case this.fractionTypeEnum.TsIsNotOnMinute: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsMomentUnit = common.FractionTsMixUnitEnum.Minute;
        break;
      }

      case this.fractionTypeEnum.TsIsOnTimestamp:
      case this.fractionTypeEnum.TsIsNotOnTimestamp: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Timestamp;
        this.fraction.tsMomentUnit = undefined; // for getMomentStr
        this.fraction.tsTimestampValue = this.timeService.getTimestampUtc();
        break;
      }

      case this.fractionTypeEnum.TsIsNull:
      case this.fractionTypeEnum.TsIsNotNull: {
        break;
      }
    }

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    if (
      this.fraction.type === common.FractionTypeEnum.TsIsInLast ||
      this.fraction.type === common.FractionTypeEnum.TsIsNotInLast
    ) {
      this.tsLastValueForm.controls['tsLastValue'].setValue(
        this.fraction.tsLastValue
      );
    }

    if (
      this.fraction.type === common.FractionTypeEnum.TsIsInNext ||
      this.fraction.type === common.FractionTypeEnum.TsIsNotInNext
    ) {
      this.tsNextValueForm.controls['tsNextValue'].setValue(
        this.fraction.tsNextValue
      );
    }

    if (
      this.fraction.type === common.FractionTypeEnum.TsIsBeginFor ||
      this.fraction.type === common.FractionTypeEnum.TsIsNotBeginFor
    ) {
      this.tsForValueForm.controls['tsForValue'].setValue(
        this.fraction.tsForValue
      );
    }

    if (
      this.fraction.type === common.FractionTypeEnum.TsIsOnTimestamp ||
      this.fraction.type === common.FractionTypeEnum.TsIsNotOnTimestamp
    ) {
      this.tsTimestampValueForm.controls['tsTimestampValue'].setValue(
        this.fraction.tsTimestampValue
      );
    }

    this.emitFractionUpdate();
  }

  yearDateValueChanged(x: any) {
    let datePickerOnYear = this.datePickerOnYear?.nativeElement;

    if (common.isDefinedAndNotEmpty(datePickerOnYear?.value)) {
      this.dateStr = datePickerOnYear.value;

      this.fraction = this.timeService.buildFraction({
        fraction: this.fraction,
        dateStr: this.dateStr,
        timeStr: this.timeStr,
        dateToStr: this.dateToStr,
        timeToStr: this.timeToStr
      });

      this.emitFractionUpdate();

      setTimeout(() => {
        datePickerOnYear.blur();
      }, 1);
    }
  }

  quarterDateValueChanged(x: any) {
    let datePickerOnQuarter = this.datePickerOnQuarter?.nativeElement;

    if (common.isDefinedAndNotEmpty(datePickerOnQuarter?.value)) {
      this.dateStr = this.timeService.getQuarterStartDate({
        dateValue: datePickerOnQuarter.value
      });

      this.fraction = this.timeService.buildFraction({
        fraction: this.fraction,
        dateStr: this.dateStr,
        timeStr: this.timeStr,
        dateToStr: this.dateToStr,
        timeToStr: this.timeToStr
      });

      this.emitFractionUpdate();

      setTimeout(() => {
        datePickerOnQuarter.blur();
      }, 1);
    }
  }

  monthDateValueChanged(x: any) {
    let datePickerOnMonth = this.datePickerOnMonth?.nativeElement;

    if (common.isDefinedAndNotEmpty(datePickerOnMonth?.value)) {
      this.dateStr = datePickerOnMonth.value;

      this.fraction = this.timeService.buildFraction({
        fraction: this.fraction,
        dateStr: this.dateStr,
        timeStr: this.timeStr,
        dateToStr: this.dateToStr,
        timeToStr: this.timeToStr
      });

      this.emitFractionUpdate();

      setTimeout(() => {
        datePickerOnMonth.blur();
      }, 1);
    }
  }

  weekDateValueChanged(x: any) {
    let datePickerOnWeek = this.datePickerOnWeek?.nativeElement;

    if (common.isDefinedAndNotEmpty(datePickerOnWeek?.value)) {
      this.dateStr = this.timeService.getWeekStartDate({
        dateValue: datePickerOnWeek.value
      });

      this.fraction = this.timeService.buildFraction({
        fraction: this.fraction,
        dateStr: this.dateStr,
        timeStr: this.timeStr,
        dateToStr: this.dateToStr,
        timeToStr: this.timeToStr
      });

      this.emitFractionUpdate();

      setTimeout(() => {
        datePickerOnWeek.blur();
      }, 1);
    }
  }

  dayDateValueChanged(x: any) {
    let datePickerOnDay = this.datePickerOnDay?.nativeElement;

    if (common.isDefinedAndNotEmpty(datePickerOnDay?.value)) {
      this.dateStr = datePickerOnDay.value;

      this.fraction = this.timeService.buildFraction({
        fraction: this.fraction,
        dateStr: this.dateStr,
        timeStr: this.timeStr,
        dateToStr: this.dateToStr,
        timeToStr: this.timeToStr
      });

      this.emitFractionUpdate();

      setTimeout(() => {
        datePickerOnDay.blur();
      }, 1);
    }
  }

  hourDateValueChanged(x: any) {
    let datePickerOnHour = this.datePickerOnHour?.nativeElement;

    if (common.isDefinedAndNotEmpty(datePickerOnHour?.value)) {
      this.dateStr = datePickerOnHour.value;

      this.fraction = this.timeService.buildFraction({
        fraction: this.fraction,
        dateStr: this.dateStr,
        timeStr: this.timeStr,
        dateToStr: this.dateToStr,
        timeToStr: this.timeToStr
      });

      this.emitFractionUpdate();

      setTimeout(() => {
        datePickerOnHour.blur();
      }, 1);
    }
  }

  hourTimeValueChanged(x: any) {
    let timePickerOnHour = this.timePickerOnHour?.nativeElement;

    if (common.isDefinedAndNotEmpty(timePickerOnHour?.value)) {
      this.timeStr = timePickerOnHour.value;

      this.fraction = this.timeService.buildFraction({
        fraction: this.fraction,
        dateStr: this.dateStr,
        timeStr: this.timeStr,
        dateToStr: this.dateToStr,
        timeToStr: this.timeToStr
      });

      this.emitFractionUpdate();

      setTimeout(() => {
        timePickerOnHour.blur();
      }, 1);
    }
  }

  hourTimeOpenedChanged(x: any) {
    setTimeout(() => {
      let timePickerOnHour = this.timePickerOnHour?.nativeElement;
      if (
        common.isDefined(timePickerOnHour) &&
        timePickerOnHour.opened === false
      ) {
        timePickerOnHour.blur();
      }
    }, 1);
  }

  minuteDateValueChanged(x: any) {
    let datePickerOnMinute = this.datePickerOnMinute?.nativeElement;
    if (common.isDefinedAndNotEmpty(datePickerOnMinute?.value)) {
      this.dateStr = datePickerOnMinute.value;

      this.fraction = this.timeService.buildFraction({
        fraction: this.fraction,
        dateStr: this.dateStr,
        timeStr: this.timeStr,
        dateToStr: this.dateToStr,
        timeToStr: this.timeToStr
      });

      this.emitFractionUpdate();

      setTimeout(() => {
        datePickerOnMinute.blur();
      }, 1);
    }
  }

  minuteTimeValueChanged(x: any) {
    let timePickerOnMinute = this.timePickerOnMinute?.nativeElement;

    if (common.isDefinedAndNotEmpty(timePickerOnMinute?.value)) {
      this.timeStr = timePickerOnMinute.value;

      this.fraction = this.timeService.buildFraction({
        fraction: this.fraction,
        dateStr: this.dateStr,
        timeStr: this.timeStr,
        dateToStr: this.dateToStr,
        timeToStr: this.timeToStr
      });

      this.emitFractionUpdate();

      setTimeout(() => {
        timePickerOnMinute.blur();
      }, 1);
    }
  }

  minuteTimeOpenedChanged(x: any) {
    setTimeout(() => {
      let timePickerOnMinute = this.timePickerOnMinute?.nativeElement;
      if (
        common.isDefined(timePickerOnMinute) &&
        timePickerOnMinute.opened === false
      ) {
        timePickerOnMinute.blur();
      }
    }, 1);
  }

  betweenFromDateValueChanged(x: any) {
    let datePickerBetweenFrom = this.datePickerBetweenFrom?.nativeElement;
    if (common.isDefined(datePickerBetweenFrom)) {
      let value = datePickerBetweenFrom.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        this.fraction = this.timeService.buildFraction({
          fraction: this.fraction,
          dateStr: this.dateStr,
          timeStr: this.timeStr,
          dateToStr: this.dateToStr,
          timeToStr: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerBetweenFrom.blur();
        }, 1);
      }
    }
  }

  betweenFromTimeValueChanged(x: any) {
    let timePickerBetweenFrom = this.timePickerBetweenFrom?.nativeElement;
    if (common.isDefined(timePickerBetweenFrom)) {
      let value = timePickerBetweenFrom.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeStr = value;

        this.fraction = this.timeService.buildFraction({
          fraction: this.fraction,
          dateStr: this.dateStr,
          timeStr: this.timeStr,
          dateToStr: this.dateToStr,
          timeToStr: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          timePickerBetweenFrom.blur();
        }, 1);
      }
    }
  }

  betweenFromTimeOpenedChanged(x: any) {
    setTimeout(() => {
      let timePickerBetweenFrom = this.timePickerBetweenFrom?.nativeElement;
      if (
        common.isDefined(timePickerBetweenFrom) &&
        timePickerBetweenFrom.opened === false
      ) {
        timePickerBetweenFrom.blur();
      }
    }, 1);
  }

  betweenToDateValueChanged(x: any) {
    let datePickerBetweenTo = this.datePickerBetweenTo?.nativeElement;
    if (common.isDefined(datePickerBetweenTo)) {
      let value = datePickerBetweenTo.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateToStr = value;

        this.fraction = this.timeService.buildFraction({
          fraction: this.fraction,
          dateStr: this.dateStr,
          timeStr: this.timeStr,
          dateToStr: this.dateToStr,
          timeToStr: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerBetweenTo.blur();
        }, 1);
      }
    }
  }

  betweenToTimeValueChanged(x: any) {
    let timePickerBetweenTo = this.timePickerBetweenTo?.nativeElement;
    if (common.isDefined(timePickerBetweenTo)) {
      let value = timePickerBetweenTo.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeToStr = value;

        this.fraction = this.timeService.buildFraction({
          fraction: this.fraction,
          dateStr: this.dateStr,
          timeStr: this.timeStr,
          dateToStr: this.dateToStr,
          timeToStr: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          timePickerBetweenTo.blur();
        }, 1);
      }
    }
  }

  betweenToTimeOpenedChanged(x: any) {
    setTimeout(() => {
      let timePickerBetweenTo = this.timePickerBetweenTo?.nativeElement;
      if (
        common.isDefined(timePickerBetweenTo) &&
        timePickerBetweenTo.opened === false
      ) {
        timePickerBetweenTo.blur();
      }
    }, 1);
  }

  beforeValueChanged(x: any) {
    let datePickerBefore = this.datePickerBefore?.nativeElement;
    if (common.isDefined(datePickerBefore)) {
      let value = datePickerBefore.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        this.fraction = this.timeService.buildFraction({
          fraction: this.fraction,
          dateStr: this.dateStr,
          timeStr: this.timeStr,
          dateToStr: this.dateToStr,
          timeToStr: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerBefore.blur();
        }, 1);
      }
    }
  }

  beforeTimeValueChanged(x: any) {
    let timePickerBefore = this.timePickerBefore?.nativeElement;
    if (common.isDefined(timePickerBefore)) {
      let value = timePickerBefore.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeStr = value;

        this.fraction = this.timeService.buildFraction({
          fraction: this.fraction,
          dateStr: this.dateStr,
          timeStr: this.timeStr,
          dateToStr: this.dateToStr,
          timeToStr: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          timePickerBefore.blur();
        }, 1);
      }
    }
  }

  beforeTimeOpenedChanged(x: any) {
    setTimeout(() => {
      let timePickerBefore = this.timePickerBefore?.nativeElement;
      if (
        common.isDefined(timePickerBefore) &&
        timePickerBefore.opened === false
      ) {
        timePickerBefore.blur();
      }
    }, 1);
  }

  throughDateValueChanged(x: any) {
    let datePickerThrough = this.datePickerThrough?.nativeElement;
    if (common.isDefined(datePickerThrough)) {
      let value = datePickerThrough.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        this.fraction = this.timeService.buildFraction({
          fraction: this.fraction,
          dateStr: this.dateStr,
          timeStr: this.timeStr,
          dateToStr: this.dateToStr,
          timeToStr: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerThrough.blur();
        }, 1);
      }
    }
  }

  throughTimeValueChanged(x: any) {
    let timePickerThrough = this.timePickerThrough?.nativeElement;
    if (common.isDefined(timePickerThrough)) {
      let value = timePickerThrough.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeStr = value;

        this.fraction = this.timeService.buildFraction({
          fraction: this.fraction,
          dateStr: this.dateStr,
          timeStr: this.timeStr,
          dateToStr: this.dateToStr,
          timeToStr: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          timePickerThrough.blur();
        }, 1);
      }
    }
  }

  throughTimeOpenedChanged(x: any) {
    setTimeout(() => {
      let timePickerThrough = this.timePickerThrough?.nativeElement;
      if (
        common.isDefined(timePickerThrough) &&
        timePickerThrough.opened === false
      ) {
        timePickerThrough.blur();
      }
    }, 1);
  }

  afterValueChanged(x: any) {
    let datePickerAfter = this.datePickerAfter?.nativeElement;
    if (common.isDefined(datePickerAfter)) {
      let value = datePickerAfter.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        this.fraction = this.timeService.buildFraction({
          fraction: this.fraction,
          dateStr: this.dateStr,
          timeStr: this.timeStr,
          dateToStr: this.dateToStr,
          timeToStr: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerAfter.blur();
        }, 1);
      }
    }
  }

  afterTimeValueChanged(x: any) {
    let timePickerAfter = this.timePickerAfter?.nativeElement;
    if (common.isDefined(timePickerAfter)) {
      let value = timePickerAfter.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeStr = value;

        this.fraction = this.timeService.buildFraction({
          fraction: this.fraction,
          dateStr: this.dateStr,
          timeStr: this.timeStr,
          dateToStr: this.dateToStr,
          timeToStr: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          timePickerAfter.blur();
        }, 1);
      }
    }
  }

  afterTimeOpenedChanged(x: any) {
    setTimeout(() => {
      let timePickerAfter = this.timePickerAfter?.nativeElement;
      if (
        common.isDefined(timePickerAfter) &&
        timePickerAfter.opened === false
      ) {
        timePickerAfter.blur();
      }
    }, 1);
  }

  startingDateValueChanged(x: any) {
    let datePickerStarting = this.datePickerStarting?.nativeElement;
    if (common.isDefined(datePickerStarting)) {
      let value = datePickerStarting.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        this.fraction = this.timeService.buildFraction({
          fraction: this.fraction,
          dateStr: this.dateStr,
          timeStr: this.timeStr,
          dateToStr: this.dateToStr,
          timeToStr: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerStarting.blur();
        }, 1);
      }
    }
  }

  startingTimeValueChanged(x: any) {
    let timePickerStarting = this.timePickerStarting?.nativeElement;
    if (common.isDefined(timePickerStarting)) {
      let value = timePickerStarting.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeStr = value;

        this.fraction = this.timeService.buildFraction({
          fraction: this.fraction,
          dateStr: this.dateStr,
          timeStr: this.timeStr,
          dateToStr: this.dateToStr,
          timeToStr: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          timePickerStarting.blur();
        }, 1);
      }
    }
  }

  startingTimeOpenedChanged(x: any) {
    setTimeout(() => {
      let timePickerStarting = this.timePickerStarting?.nativeElement;
      if (
        common.isDefined(timePickerStarting) &&
        timePickerStarting.opened === false
      ) {
        timePickerStarting.blur();
      }
    }, 1);
  }

  beginForDateValueChanged(x: any) {
    let datePickerBeginFor = this.datePickerBeginFor?.nativeElement;
    if (common.isDefined(datePickerBeginFor)) {
      let value = datePickerBeginFor.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        this.fraction = this.timeService.buildFraction({
          fraction: this.fraction,
          dateStr: this.dateStr,
          timeStr: this.timeStr,
          dateToStr: this.dateToStr,
          timeToStr: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerBeginFor.blur();
        }, 1);
      }
    }
  }

  beginForTimeValueChanged(x: any) {
    let timePickerBeginFor = this.timePickerBeginFor?.nativeElement;
    if (common.isDefined(timePickerBeginFor)) {
      let value = timePickerBeginFor.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeStr = value;

        this.fraction = this.timeService.buildFraction({
          fraction: this.fraction,
          dateStr: this.dateStr,
          timeStr: this.timeStr,
          dateToStr: this.dateToStr,
          timeToStr: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          timePickerBeginFor.blur();
        }, 1);
      }
    }
  }

  beginForTimeOpenedChanged(x: any) {
    setTimeout(() => {
      let timePickerBeginFor = this.timePickerBeginFor?.nativeElement;
      if (
        common.isDefined(timePickerBeginFor) &&
        timePickerBeginFor.opened === false
      ) {
        timePickerBeginFor.blur();
      }
    }, 1);
  }

  lastValueBlur() {
    let value = this.tsLastValueForm.controls['tsLastValue'].value;

    if (Number(value) === this.fraction.tsLastValue) {
      return;
    }

    this.fraction.tsLastValue = Number(value);

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  lastUnitChange() {
    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  lastCompleteOptionChange() {
    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  nextValueBlur() {
    let value = this.tsNextValueForm.controls['tsNextValue'].value;

    if (Number(value) === this.fraction.tsNextValue) {
      return;
    }

    this.fraction.tsNextValue = Number(value);

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  nextUnitChange() {
    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  momentChange() {
    if (
      this.fraction.tsMomentType === common.FractionTsMomentTypeEnum.Timestamp
    ) {
      this.fraction.tsTimestampValue = this.timeService.getTimestampUtc();
    }

    this.fraction.tsMomentUnit =
      this.fraction.tsMomentType === common.FractionTsMomentTypeEnum.Now ||
      this.fraction.tsMomentType === common.FractionTsMomentTypeEnum.Timestamp
        ? undefined
        : this.fractionTsMixUnitsTempList
              .map(x => x.value)
              .indexOf(this.fraction.tsMomentUnit) > -1
          ? this.fraction.tsMomentUnit
          : common.FractionTsMixUnitEnum.Day;

    if (
      [
        common.FractionTsMomentTypeEnum.Ago,
        common.FractionTsMomentTypeEnum.FromNow
      ].indexOf(this.fraction.tsMomentType) > -1
    ) {
      this.fraction.tsMomentAgoFromNowQuantity = 1;
    }

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    if (
      [
        common.FractionTsMomentTypeEnum.Ago,
        common.FractionTsMomentTypeEnum.FromNow
      ].indexOf(this.fraction.tsMomentType) > -1
    ) {
      this.tsMomentAgoFromNowQuantityForm.controls[
        'tsMomentAgoFromNowQuantity'
      ].setValue(this.fraction.tsMomentAgoFromNowQuantity);
    }

    if (
      this.fraction.tsMomentType === common.FractionTsMomentTypeEnum.Timestamp
    ) {
      this.tsTimestampValueForm.controls['tsTimestampValue'].setValue(
        this.fraction.tsTimestampValue
      );
    }

    this.emitFractionUpdate();
  }

  betweenFromMomentChange() {
    if (
      this.fraction.tsFromMomentType ===
      common.FractionTsMomentTypeEnum.Timestamp
    ) {
      this.fraction.tsFromTimestampValue = this.timeService.getTimestampUtc();
    }

    this.fraction.tsFromMomentUnit =
      this.fraction.tsFromMomentType === common.FractionTsMomentTypeEnum.Now ||
      this.fraction.tsFromMomentType ===
        common.FractionTsMomentTypeEnum.Timestamp
        ? undefined
        : this.fractionTsMixUnitsTempList
              .map(x => x.value)
              .indexOf(this.fraction.tsFromMomentUnit) > -1
          ? this.fraction.tsFromMomentUnit
          : common.FractionTsMixUnitEnum.Day;

    if (
      [
        common.FractionTsMomentTypeEnum.Ago,
        common.FractionTsMomentTypeEnum.FromNow
      ].indexOf(this.fraction.tsFromMomentType) > -1
    ) {
      this.fraction.tsFromMomentAgoFromNowQuantity = 1;
    }

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    if (
      [
        common.FractionTsMomentTypeEnum.Ago,
        common.FractionTsMomentTypeEnum.FromNow
      ].indexOf(this.fraction.tsFromMomentType) > -1
    ) {
      this.tsFromMomentAgoFromNowQuantityForm.controls[
        'tsFromMomentAgoFromNowQuantity'
      ].setValue(this.fraction.tsFromMomentAgoFromNowQuantity);
    }

    if (
      this.fraction.tsFromMomentType ===
      common.FractionTsMomentTypeEnum.Timestamp
    ) {
      this.tsFromTimestampValueForm.controls['tsFromTimestampValue'].setValue(
        this.fraction.tsFromTimestampValue
      );
    }

    this.emitFractionUpdate();
  }

  betweenToMomentChange() {
    if (
      this.fraction.tsToMomentType === common.FractionTsMomentTypeEnum.Timestamp
    ) {
      this.fraction.tsToTimestampValue = this.timeService.getTimestampUtc();
    }

    this.fraction.tsToMomentUnit =
      this.fraction.tsToMomentType === common.FractionTsMomentTypeEnum.Now ||
      this.fraction.tsToMomentType === common.FractionTsMomentTypeEnum.Timestamp
        ? undefined
        : this.fractionTsMixUnitsTempList
              .map(x => x.value)
              .indexOf(this.fraction.tsToMomentUnit) > -1
          ? this.fraction.tsToMomentUnit
          : common.FractionTsMixUnitEnum.Day;

    if (
      [
        common.FractionTsMomentTypeEnum.Ago,
        common.FractionTsMomentTypeEnum.FromNow
      ].indexOf(this.fraction.tsToMomentType) > -1
    ) {
      this.fraction.tsToMomentAgoFromNowQuantity = 1;
    }

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    if (
      [
        common.FractionTsMomentTypeEnum.Ago,
        common.FractionTsMomentTypeEnum.FromNow
      ].indexOf(this.fraction.tsToMomentType) > -1
    ) {
      this.tsToMomentAgoFromNowQuantityForm.controls[
        'tsToMomentAgoFromNowQuantity'
      ].setValue(this.fraction.tsToMomentAgoFromNowQuantity);
    }

    if (
      this.fraction.tsToMomentType === common.FractionTsMomentTypeEnum.Timestamp
    ) {
      this.tsToTimestampValueForm.controls['tsToTimestampValue'].setValue(
        this.fraction.tsToTimestampValue
      );
    }

    this.emitFractionUpdate();
  }

  onUnitChange() {
    if (this.fraction.tsMomentUnit === 'week') {
      this.dateStr = this.timeService.getWeekStartDate({
        dateValue: this.dateStr
      });
    } else if (this.fraction.tsMomentUnit === 'quarter') {
      this.dateStr = this.timeService.getQuarterStartDate({
        dateValue: this.dateStr
      });
    }

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  betweenFromUnitChange() {
    if (this.fraction.tsFromMomentUnit === 'week') {
      this.dateStr = this.timeService.getWeekStartDate({
        dateValue: this.dateStr
      });
    } else if (this.fraction.tsFromMomentUnit === 'quarter') {
      this.dateStr = this.timeService.getQuarterStartDate({
        dateValue: this.dateStr
      });
    }

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  betweenToUnitChange() {
    if (this.fraction.tsToMomentUnit === 'week') {
      this.dateToStr = this.timeService.getWeekStartDate({
        dateValue: this.dateToStr
      });
    } else if (this.fraction.tsToMomentUnit === 'quarter') {
      this.dateToStr = this.timeService.getQuarterStartDate({
        dateValue: this.dateToStr
      });
    }

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  timestampValueBlur() {
    let value = this.tsTimestampValueForm.controls['tsTimestampValue'].value;

    if (value === this.fraction.tsTimestampValue) {
      return;
    }

    this.fraction.tsTimestampValue = value;

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  betweenFromTimestampValueBlur() {
    let value =
      this.tsFromTimestampValueForm.controls['tsFromTimestampValue'].value;

    if (value === this.fraction.tsFromTimestampValue) {
      return;
    }

    this.fraction.tsFromTimestampValue = value;

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  betweenToTimestampValueBlur() {
    let value =
      this.tsToTimestampValueForm.controls['tsToTimestampValue'].value;

    if (value === this.fraction.tsToTimestampValue) {
      return;
    }

    this.fraction.tsToTimestampValue = value;

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  agoFromNowQuantityBlur() {
    let value =
      this.tsMomentAgoFromNowQuantityForm.controls['tsMomentAgoFromNowQuantity']
        .value;

    if (Number(value) === this.fraction.tsMomentAgoFromNowQuantity) {
      return;
    }

    this.fraction.tsMomentAgoFromNowQuantity = Number(value);

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  betweenFromMomentAgoFromNowQuantityBlur() {
    let value =
      this.tsFromMomentAgoFromNowQuantityForm.controls[
        'tsFromMomentAgoFromNowQuantity'
      ].value;

    if (Number(value) === this.fraction.tsFromMomentAgoFromNowQuantity) {
      return;
    }

    this.fraction.tsFromMomentAgoFromNowQuantity = Number(value);

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  betweenToMomentAgoFromNowQuantityBlur() {
    let value =
      this.tsToMomentAgoFromNowQuantityForm.controls[
        'tsToMomentAgoFromNowQuantity'
      ].value;

    if (Number(value) === this.fraction.tsToMomentAgoFromNowQuantity) {
      return;
    }

    this.fraction.tsToMomentAgoFromNowQuantity = Number(value);

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  agoFromNowUnitChange() {
    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  betweenFromMomentAgoFromNowUnitChange() {
    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  betweenToMomentAgoFromNowUnitChange() {
    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  forValueBlur() {
    let value = this.tsForValueForm.controls['tsForValue'].value;

    if (Number(value) === this.fraction.tsForValue) {
      return;
    }

    this.fraction.tsForValue = Number(value);

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  tsForUnitChange() {
    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    this.emitFractionUpdate();
  }

  emitFractionUpdate() {
    if (
      ([
        common.FractionTypeEnum.TsIsInLast,
        common.FractionTypeEnum.TsIsNotInLast
      ].indexOf(this.fraction.type) > -1 &&
        this.tsLastValueForm.valid === false) ||
      ([
        common.FractionTypeEnum.TsIsInNext,
        common.FractionTypeEnum.TsIsNotInNext
      ].indexOf(this.fraction.type) > -1 &&
        this.tsNextValueForm.valid === false) ||
      ([
        common.FractionTypeEnum.TsIsBeginFor,
        common.FractionTypeEnum.TsIsNotBeginFor
      ].indexOf(this.fraction.type) > -1 &&
        this.tsForValueForm.valid === false) ||
      (this.fraction.tsMomentType ===
        common.FractionTsMomentTypeEnum.Timestamp &&
        this.tsTimestampValueForm.valid === false) ||
      ([
        common.FractionTsMomentTypeEnum.Ago,
        common.FractionTsMomentTypeEnum.FromNow
      ].indexOf(this.fraction.tsMomentType) > -1 &&
        this.tsMomentAgoFromNowQuantityForm.valid === false) ||
      ([
        common.FractionTypeEnum.TsIsBetween,
        common.FractionTypeEnum.TsIsNotBetween
      ].indexOf(this.fraction.type) > -1 &&
        ((this.fraction.tsFromMomentType ===
          common.FractionTsMomentTypeEnum.Timestamp &&
          this.tsFromTimestampValueForm.valid === false) ||
          (this.fraction.tsToMomentType ===
            common.FractionTsMomentTypeEnum.Timestamp &&
            this.tsToTimestampValueForm.valid === false) ||
          ([
            common.FractionTsMomentTypeEnum.Ago,
            common.FractionTsMomentTypeEnum.FromNow
          ].indexOf(this.fraction.tsFromMomentType) > -1 &&
            this.tsFromMomentAgoFromNowQuantityForm.valid === false) ||
          ([
            common.FractionTsMomentTypeEnum.Ago,
            common.FractionTsMomentTypeEnum.FromNow
          ].indexOf(this.fraction.tsToMomentType) > -1 &&
            this.tsToMomentAgoFromNowQuantityForm.valid === false)))
    ) {
      return;
    }

    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }
}
