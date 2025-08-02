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
import { UiQuery } from '~front/app/queries/ui.query';
import { TimeService } from '~front/app/services/time.service';
import { UiService } from '~front/app/services/ui.service';
import { ValidationService } from '~front/app/services/validation.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import {
  FractionTsDayOfWeekLcItem,
  FractionTsLastCompleteOptionItem,
  FractionTsMomentTypesItem,
  FractionTsTemporalUnitItem,
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

  @ViewChild('datePickerInRangeFrom')
  datePickerInRangeFrom: ElementRef<DatePicker>;
  @ViewChild('timePickerInRangeFrom')
  timePickerInRangeFrom: ElementRef<TimePicker>;

  @ViewChild('datePickerInRangeTo') datePickerInRangeTo: ElementRef<DatePicker>;
  @ViewChild('timePickerInRangeTo') timePickerInRangeTo: ElementRef<TimePicker>;

  tsTimestampValueForm: FormGroup;
  tsForValueForm: FormGroup;
  tsLastValueForm: FormGroup;
  tsNextValueForm: FormGroup;
  tsMomentAgoFromNowQuantityForm: FormGroup;

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
      value: common.FractionTypeEnum.TsIsAfterDate,
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
      value: common.FractionTypeEnum.TsIsInRange,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is before',
      value: common.FractionTypeEnum.TsIsBeforeDate,
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
    //   value: common.FractionTypeEnum.TsIsNotAfterDate, // is through
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
      value: common.FractionTypeEnum.TsIsNotInRange,
      operator: common.FractionOperatorEnum.And
    },
    // {
    //   label: 'is not before',
    //   value: common.FractionTypeEnum.TsIsNotBeforeDate, // is starting
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
      label: 'literal',
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
      label: 'DOW last',
      value: common.FractionTsMomentTypeEnum.LastDayOfWeek
    },
    {
      label: 'DOW next',
      value: common.FractionTsMomentTypeEnum.NextDayOfWeek
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

  fractionTsOnUnitsList: FractionTsTemporalUnitItem[] = [];
  fractionTsAgoFromNowUnitsList: FractionTsTemporalUnitItem[] = [];
  fractionTsTempUnitsFullList: FractionTsTemporalUnitItem[] = [
    {
      label: 'Day',
      value: 'day'
    },
    {
      label: 'Week',
      value: 'week'
    },
    {
      label: 'Month',
      value: 'month'
    },
    {
      label: 'Quarter',
      value: 'quarter'
    },
    {
      label: 'Year',
      value: 'year'
    },
    {
      label: 'Hour',
      value: 'hour'
    },
    {
      label: 'Minute',
      value: 'minute'
    }
  ];

  fractionTsLastNextUnitsList: FractionTsUnitItem[] = [];
  fractionTsForUnitsList: FractionTsUnitItem[] = [];
  fractionTsUnitsFullList: FractionTsUnitItem[] = [
    {
      label: 'Days',
      value: common.FractionTsUnitEnum.Days
    },
    {
      label: 'Weeks',
      value: common.FractionTsUnitEnum.Weeks
    },
    {
      label: 'Months',
      value: common.FractionTsUnitEnum.Months
    },
    {
      label: 'Quarters',
      value: common.FractionTsUnitEnum.Quarters
    },
    {
      label: 'Years',
      value: common.FractionTsUnitEnum.Years
    },
    {
      label: 'Hours',
      value: common.FractionTsUnitEnum.Hours
    },
    {
      label: 'Minutes',
      value: common.FractionTsUnitEnum.Minutes
    }
  ];

  fractionTsDayOfWeekLcList: FractionTsDayOfWeekLcItem[] = [
    {
      label: 'Monday',
      value: common.FractionDayOfWeekLcEnum.Monday
    },
    {
      label: 'Tuesday',
      value: common.FractionDayOfWeekLcEnum.Tuesday
    },
    {
      label: 'Wednesday',
      value: common.FractionDayOfWeekLcEnum.Wednesday
    },
    {
      label: 'Thursday',
      value: common.FractionDayOfWeekLcEnum.Thursday
    },
    {
      label: 'Friday',
      value: common.FractionDayOfWeekLcEnum.Friday
    },
    {
      label: 'Saturday',
      value: common.FractionDayOfWeekLcEnum.Saturday
    },
    {
      label: 'Sunday',
      value: common.FractionDayOfWeekLcEnum.Sunday
    }
  ];

  fractionTsLastCompleteOptionsList: FractionTsLastCompleteOptionItem[] = [
    {
      label: 'completed with current',
      value: common.FractionTsLastCompleteOptionEnum.CompleteWithCurrent
    },
    // {
    //   label: 'completed plus current',
    //   value: common.FractionTsLastCompleteOptionEnum.CompletePlusCurrent
    // },
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
  beforeDateI18n = Object.assign({}, this.commonI18n);
  throughI18n = Object.assign({}, this.commonI18n);
  afterDateI18n = Object.assign({}, this.commonI18n);
  startingI18n = Object.assign({}, this.commonI18n);
  beginForI18n = Object.assign({}, this.commonI18n, {
    formatDate: (d: DatePickerDate) => {
      if (this.fraction.tsMomentUnit === 'year') {
        return `${d.year}`;
      } else if (this.fraction.tsMomentUnit === 'quarter') {
        let monthIndex = d.month + 1;
        let month =
          monthIndex.toString().length === 1
            ? `0${monthIndex}`
            : `${monthIndex}`;

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
      } else if (this.fraction.tsMomentUnit === 'month') {
        let monthIndex = d.month + 1;
        let month =
          monthIndex.toString().length === 1
            ? `0${monthIndex}`
            : `${monthIndex}`;

        return `${d.year}-${month}`;
      } else if (this.fraction.tsMomentUnit === 'week') {
        let monthIndex = d.month + 1;
        let month =
          monthIndex.toString().length === 1
            ? `0${monthIndex}`
            : `${monthIndex}`;

        let day = d.day.toString().length === 1 ? `0${d.day}` : `${d.day}`;

        return `${d.year}-${month}-${day}-WK`;
      } else {
        let monthIndex = d.month + 1;
        let month =
          monthIndex.toString().length === 1
            ? `0${monthIndex}`
            : `${monthIndex}`;

        let day = d.day.toString().length === 1 ? `0${d.day}` : `${d.day}`;

        return `${d.year}-${month}-${day}`;
      }
    }
  });
  inRangeFromDateI18n = Object.assign({}, this.commonI18n);
  inRangeToDateI18n = Object.assign({}, this.commonI18n);

  dateStr: string;
  dateToStr: string;

  timeStr: string;
  timeToStr: string;

  constructor(
    private fb: FormBuilder,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private structQuery: StructQuery,
    private timeService: TimeService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // console.log(this.timeStr);
    this.fractionTsTypesList =
      this.isMetrics === false
        ? this.fractionTsTypesFullList
        : this.fractionTsTypesFullList.filter(
            x =>
              [
                common.FractionTypeEnum.TsIsInLast,
                common.FractionTypeEnum.TsIsInNext,
                common.FractionTypeEnum.TsIsAfterDate,
                common.FractionTypeEnum.TsIsStarting,
                common.FractionTypeEnum.TsIsBeginFor,
                common.FractionTypeEnum.TsIsOnDay,
                common.FractionTypeEnum.TsIsOnWeek,
                common.FractionTypeEnum.TsIsOnMonth,
                common.FractionTypeEnum.TsIsOnQuarter,
                common.FractionTypeEnum.TsIsOnYear,
                common.FractionTypeEnum.TsIsInRange,
                common.FractionTypeEnum.TsIsBeforeDate,
                common.FractionTypeEnum.TsIsThrough,
                common.FractionTypeEnum.TsIsOnHour,
                common.FractionTypeEnum.TsIsOnMinute,
                common.FractionTypeEnum.TsIsOnTimestamp
              ].indexOf(x.value) > -1
          );

    this.fractionTsOnUnitsList = this.fractionTsTempUnitsFullList;
    this.fractionTsAgoFromNowUnitsList = this.fractionTsTempUnitsFullList;
    this.fractionTsLastNextUnitsList = this.fractionTsUnitsFullList;
    this.fractionTsForUnitsList = this.fractionTsUnitsFullList;

    this.resetDates({ useFraction: true });

    this.buildTimestampValueForm();
    this.buildForValueForm();
    this.buildLastValueForm();
    this.buildNextValueForm();
    this.buildAgoFromNowQuantityForm();

    let structState = this.structQuery.getValue();

    let firstDayOfWeek =
      structState.weekStart === common.ProjectWeekStartEnum.Monday ? 1 : 0;

    this.onYearDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onQuarterDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onMonthDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onWeekDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onDayDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onHourDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onMinuteDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.beforeDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.afterDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.inRangeFromDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.inRangeToDateI18n.firstDayOfWeek = firstDayOfWeek;
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
          common.FractionTypeEnum.TsIsOnMinute
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
        [common.FractionTypeEnum.TsIsOnDay].indexOf(
          (changes.fraction.currentValue as common.Fraction).type
        ) > -1
      ) {
        this.fractionTsMomentTypesList =
          this.fractionTsMomentTypesFullList.filter(
            x =>
              [
                common.FractionTsMomentTypeEnum.Literal,
                common.FractionTsMomentTypeEnum.Today,
                common.FractionTsMomentTypeEnum.Yesterday,
                common.FractionTsMomentTypeEnum.Tomorrow,
                common.FractionTsMomentTypeEnum.LastDayOfWeek,
                common.FractionTsMomentTypeEnum.NextDayOfWeek,
                common.FractionTsMomentTypeEnum.This,
                common.FractionTsMomentTypeEnum.Last,
                common.FractionTsMomentTypeEnum.Next,
                common.FractionTsMomentTypeEnum.Ago,
                common.FractionTsMomentTypeEnum.FromNow
              ].indexOf(x.value) > -1
          );
      } else if (
        [common.FractionTypeEnum.TsIsOnTimestamp].indexOf(
          (changes.fraction.currentValue as common.Fraction).type
        ) > -1
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
          common.FractionTypeEnum.TsIsBeforeDate,
          common.FractionTypeEnum.TsIsThrough,
          common.FractionTypeEnum.TsIsAfterDate,
          common.FractionTypeEnum.TsIsStarting,
          common.FractionTypeEnum.TsIsBeginFor
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
                common.FractionTsMomentTypeEnum.LastDayOfWeek,
                common.FractionTsMomentTypeEnum.NextDayOfWeek,
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

  buildTimestampValueForm() {
    this.tsTimestampValueForm = this.fb.group({
      tsTimestampValue: [
        this.fraction.tsTimestampValue,
        [Validators.required, ValidationService.timestampValidator]
      ]
    });
  }

  buildForValueForm() {
    this.tsForValueForm = this.fb.group({
      tsForValue: [
        this.fraction.tsForValue,
        [
          Validators.required,
          ValidationService.integerOrEmptyValidator,
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
          ValidationService.integerOrEmptyValidator,
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
          ValidationService.integerOrEmptyValidator,
          Validators.min(0)
        ]
      ]
    });
  }

  buildAgoFromNowQuantityForm() {
    this.tsMomentAgoFromNowQuantityForm = this.fb.group({
      tsMomentAgoFromNowQuantity: [
        this.fraction.tsMomentAgoFromNowQuantity,
        [
          Validators.required,
          ValidationService.integerOrEmptyValidator,
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
        this.fraction = this.timeService.buildFractionAny({
          fraction: this.fraction
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsInLast: {
        this.fraction.tsLastValue = 5;
        this.fraction.tsLastUnit = common.FractionTsUnitEnum.Days;
        this.fraction.tsLastCompleteOption =
          common.FractionTsLastCompleteOptionEnum.CompleteWithCurrent;

        this.fraction = this.timeService.buildFractionLast({
          fraction: this.fraction
        });

        this.tsLastValueForm.controls['tsLastValue'].setValue(
          this.fraction.tsLastValue
        );

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnDay: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;

        this.fraction = this.timeService.buildFractionOnDay({
          fraction: this.fraction,
          dateValue: this.dateStr
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnWeek: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;

        this.dateStr = this.timeService.getWeekStartDate({
          dateValue: this.dateStr
        });

        this.fraction = this.timeService.buildFractionOnWeek({
          fraction: this.fraction,
          dateValue: this.dateStr
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnMonth: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;

        this.fraction = this.timeService.buildFractionOnMonth({
          fraction: this.fraction,
          dateValue: this.dateStr
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnQuarter: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;

        this.dateStr = this.timeService.getQuarterStartDate({
          dateValue: this.dateStr
        });

        this.fraction = this.timeService.buildFractionOnQuarter({
          fraction: this.fraction,
          dateValue: this.dateStr
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnYear: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;

        this.fraction = this.timeService.buildFractionOnYear({
          fraction: this.fraction,
          dateValue: this.dateStr
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsInNext: {
        this.fraction.tsNextValue = 5;
        this.fraction.tsNextUnit = common.FractionTsUnitEnum.Days;

        this.fraction = this.timeService.buildFractionNext({
          fraction: this.fraction
        });

        this.tsNextValueForm.controls['tsNextValue'].setValue(
          this.fraction.tsNextValue
        );

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsAfterDate: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;

        this.fraction = this.timeService.buildFractionAfterDate({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: this.timeStr
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsStarting: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;

        this.fraction = this.timeService.buildFractionStarting({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: this.timeStr
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsBeginFor: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsMomentUnit = 'day';

        this.fraction.tsForValue = 1;
        this.fraction.tsForUnit = common.FractionTsUnitEnum.Weeks;

        this.fraction = this.timeService.buildFractionBeginFor({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: this.timeStr
        });

        this.tsForValueForm.controls['tsForValue'].setValue(
          this.fraction.tsForValue
        );

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsInRange: {
        this.fraction.tsFromMomentType =
          common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsFromMomentPartValue =
          common.FractionDayOfWeekLcEnum.Monday;
        this.fraction.tsFromMomentAgoFromNowQuantity = 1;
        this.fraction.tsFromMomentUnit = 'day';

        this.fraction.tsToMomentType = common.FractionTsMomentTypeEnum.Literal;
        this.fraction.tsToMomentPartValue =
          common.FractionDayOfWeekLcEnum.Monday;
        this.fraction.tsToMomentAgoFromNowQuantity = 1;
        this.fraction.tsToMomentUnit = 'day';

        this.fraction = this.timeService.buildFractionRange({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: this.timeStr,
          dateToValue: this.dateToStr,
          timeToValue: this.timeToStr
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsBeforeDate: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;

        this.fraction = this.timeService.buildFractionBeforeDate({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: this.timeStr
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsThrough: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;

        this.fraction = this.timeService.buildFractionThrough({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: this.timeStr
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnHour: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;

        this.fraction = this.timeService.buildFractionOnHour({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: this.timeStr
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnMinute: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Literal;

        this.fraction = this.timeService.buildFractionOnMinute({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: this.timeStr
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnTimestamp: {
        this.fraction.tsMomentType = common.FractionTsMomentTypeEnum.Timestamp;

        this.fraction.tsTimestampValue = this.timeService.getTimestampUtc();

        this.fraction = this.timeService.buildFractionOnTimestamp({
          fraction: this.fraction
        });

        this.tsTimestampValueForm.controls['tsTimestampValue'].setValue(
          this.fraction.tsTimestampValue
        );

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsNull: {
        this.fraction = this.timeService.buildFractionNull({
          fraction: this.fraction
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsNotNull: {
        this.fraction = this.timeService.buildFractionNotNull({
          fraction: this.fraction
        });

        this.emitFractionUpdate();
        break;
      }

      default: {
      }
    }
  }

  yearDateValueChanged(x: any) {
    let datePickerOnYear = this.datePickerOnYear?.nativeElement;

    if (common.isDefinedAndNotEmpty(datePickerOnYear?.value)) {
      this.dateStr = datePickerOnYear.value;

      this.fraction = this.timeService.buildFractionOnYear({
        fraction: this.fraction,
        dateValue: this.dateStr
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

      this.fraction = this.timeService.buildFractionOnQuarter({
        fraction: this.fraction,
        dateValue: this.dateStr
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

      this.fraction = this.timeService.buildFractionOnMonth({
        fraction: this.fraction,
        dateValue: this.dateStr
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

      this.fraction = this.timeService.buildFractionOnWeek({
        fraction: this.fraction,
        dateValue: this.dateStr
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

      this.fraction = this.timeService.buildFractionOnDay({
        fraction: this.fraction,
        dateValue: this.dateStr
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

      this.fraction = this.timeService.buildFractionOnHour({
        fraction: this.fraction,
        dateValue: this.dateStr,
        timeValue: this.timeStr
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

      this.fraction = this.timeService.buildFractionOnHour({
        fraction: this.fraction,
        dateValue: this.dateStr,
        timeValue: this.timeStr
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

      this.fraction = this.timeService.buildFractionOnMinute({
        fraction: this.fraction,
        dateValue: this.dateStr,
        timeValue: this.timeStr
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

      this.fraction = this.timeService.buildFractionOnMinute({
        fraction: this.fraction,
        dateValue: this.dateStr,
        timeValue: this.timeStr
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

  inRangeFromDateValueChanged(x: any) {
    let datePickerInRangeFrom = this.datePickerInRangeFrom?.nativeElement;
    if (common.isDefined(datePickerInRangeFrom)) {
      let value = datePickerInRangeFrom.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        this.fraction = this.timeService.buildFractionRange({
          fraction: this.fraction,
          dateValue: value,
          timeValue: this.timeStr,
          dateToValue: this.dateToStr,
          timeToValue: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerInRangeFrom.blur();
        }, 1);
      }
    }
  }

  inRangeFromTimeValueChanged(x: any) {
    let timePickerInRangeFrom = this.timePickerInRangeFrom?.nativeElement;
    if (common.isDefined(timePickerInRangeFrom)) {
      let value = timePickerInRangeFrom.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeStr = value;

        this.fraction = this.timeService.buildFractionRange({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: value,
          dateToValue: this.dateToStr,
          timeToValue: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          timePickerInRangeFrom.blur();
        }, 1);
      }
    }
  }

  inRangeFromTimeOpenedChanged(x: any) {
    setTimeout(() => {
      let timePickerInRangeFrom = this.timePickerInRangeFrom?.nativeElement;
      if (
        common.isDefined(timePickerInRangeFrom) &&
        timePickerInRangeFrom.opened === false
      ) {
        timePickerInRangeFrom.blur();
      }
    }, 1);
  }

  inRangeToDateValueChanged(x: any) {
    let datePickerInRangeTo = this.datePickerInRangeTo?.nativeElement;
    if (common.isDefined(datePickerInRangeTo)) {
      let value = datePickerInRangeTo.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateToStr = value;

        this.fraction = this.timeService.buildFractionRange({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: this.timeStr,
          dateToValue: value,
          timeToValue: this.timeToStr
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerInRangeTo.blur();
        }, 1);
      }
    }
  }

  inRangeToTimeValueChanged(x: any) {
    let timePickerInRangeTo = this.timePickerInRangeTo?.nativeElement;
    if (common.isDefined(timePickerInRangeTo)) {
      let value = timePickerInRangeTo.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeToStr = value;

        this.fraction = this.timeService.buildFractionRange({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: this.timeStr,
          dateToValue: this.dateToStr,
          timeToValue: value
        });

        this.emitFractionUpdate();

        setTimeout(() => {
          timePickerInRangeTo.blur();
        }, 1);
      }
    }
  }

  inRangeToTimeOpenedChanged(x: any) {
    setTimeout(() => {
      let timePickerInRangeTo = this.timePickerInRangeTo?.nativeElement;
      if (
        common.isDefined(timePickerInRangeTo) &&
        timePickerInRangeTo.opened === false
      ) {
        timePickerInRangeTo.blur();
      }
    }, 1);
  }

  beforeDateValueChanged(x: any) {
    let datePickerBefore = this.datePickerBefore?.nativeElement;
    if (common.isDefined(datePickerBefore)) {
      let value = datePickerBefore.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        this.fraction = this.timeService.buildFractionBeforeDate({
          fraction: this.fraction,
          dateValue: value,
          timeValue: this.timeStr
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

        this.fraction = this.timeService.buildFractionBeforeDate({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: value
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

        this.fraction = this.timeService.buildFractionThrough({
          fraction: this.fraction,
          dateValue: value,
          timeValue: this.timeStr
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

        this.fraction = this.timeService.buildFractionThrough({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: value
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

  afterDateValueChanged(x: any) {
    let datePickerAfter = this.datePickerAfter?.nativeElement;
    if (common.isDefined(datePickerAfter)) {
      let value = datePickerAfter.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        this.fraction = this.timeService.buildFractionAfterDate({
          fraction: this.fraction,
          dateValue: value,
          timeValue: this.timeStr
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

        this.fraction = this.timeService.buildFractionAfterDate({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: value
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

        this.fraction = this.timeService.buildFractionStarting({
          fraction: this.fraction,
          dateValue: value,
          timeValue: this.timeStr
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

        this.fraction = this.timeService.buildFractionStarting({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: value
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

        this.fraction = this.timeService.buildFractionBeginFor({
          fraction: this.fraction,
          dateValue: value,
          timeValue: this.timeStr
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

        this.fraction = this.timeService.buildFractionBeginFor({
          fraction: this.fraction,
          dateValue: this.dateStr,
          timeValue: value
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

    this.fraction = this.timeService.buildFractionLast({
      fraction: this.fraction
    });

    this.emitFractionUpdate();
  }

  lastUnitChange() {
    this.fraction = this.timeService.buildFractionLast({
      fraction: this.fraction
    });

    this.emitFractionUpdate();
  }

  lastCompleteOptionChange() {
    this.fraction = this.timeService.buildFractionLast({
      fraction: this.fraction
    });

    this.emitFractionUpdate();
  }

  nextValueBlur() {
    let value = this.tsNextValueForm.controls['tsNextValue'].value;

    if (Number(value) === this.fraction.tsNextValue) {
      return;
    }

    this.fraction.tsNextValue = Number(value);

    this.fraction = this.timeService.buildFractionNext({
      fraction: this.fraction
    });

    this.emitFractionUpdate();
  }

  nextUnitChange() {
    this.fraction = this.timeService.buildFractionNext({
      fraction: this.fraction
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
        : (this.fraction.tsMomentUnit ?? 'day');

    this.fraction.tsMomentPartValue =
      [
        common.FractionTsMomentTypeEnum.LastDayOfWeek,
        common.FractionTsMomentTypeEnum.NextDayOfWeek
      ].indexOf(this.fraction.tsMomentType) > -1
        ? [
            common.FractionDayOfWeekLcEnum.Sunday.toString(),
            common.FractionDayOfWeekLcEnum.Monday.toString(),
            common.FractionDayOfWeekLcEnum.Tuesday.toString(),
            common.FractionDayOfWeekLcEnum.Wednesday.toString(),
            common.FractionDayOfWeekLcEnum.Thursday.toString(),
            common.FractionDayOfWeekLcEnum.Friday.toString(),
            common.FractionDayOfWeekLcEnum.Saturday.toString()
          ].indexOf(this.fraction.tsMomentPartValue) > -1
          ? this.fraction.tsMomentPartValue
          : common.FractionDayOfWeekLcEnum.Monday
        : undefined;

    if (
      [
        common.FractionTsMomentTypeEnum.Ago,
        common.FractionTsMomentTypeEnum.FromNow
      ].indexOf(this.fraction.tsMomentType) > -1
    ) {
      this.fraction.tsMomentAgoFromNowQuantity =
        this.fraction.tsMomentAgoFromNowQuantity ?? 1;
      this.fraction.tsMomentUnit = this.fraction.tsMomentUnit ?? 'day';
    }

    if (this.fraction.type === common.FractionTypeEnum.TsIsBeginFor) {
      this.fraction = this.timeService.buildFractionBeginFor({
        fraction: this.fraction,
        dateValue: this.dateStr,
        timeValue: this.timeStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnYear) {
      this.fraction = this.timeService.buildFractionOnYear({
        fraction: this.fraction,
        dateValue: this.dateStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnQuarter) {
      this.fraction = this.timeService.buildFractionOnQuarter({
        fraction: this.fraction,
        dateValue: this.dateStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnMonth) {
      this.fraction = this.timeService.buildFractionOnMonth({
        fraction: this.fraction,
        dateValue: this.dateStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnWeek) {
      this.fraction = this.timeService.buildFractionOnWeek({
        fraction: this.fraction,
        dateValue: this.dateStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnDay) {
      this.fraction = this.timeService.buildFractionOnDay({
        fraction: this.fraction,
        dateValue: this.dateStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnHour) {
      this.fraction = this.timeService.buildFractionOnHour({
        fraction: this.fraction,
        dateValue: this.dateStr,
        timeValue: this.timeStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnMinute) {
      this.fraction = this.timeService.buildFractionOnMinute({
        fraction: this.fraction,
        dateValue: this.dateStr,
        timeValue: this.timeStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnTimestamp) {
      this.fraction = this.timeService.buildFractionOnTimestamp({
        fraction: this.fraction
      });
    }

    if (
      this.fraction.tsMomentType === common.FractionTsMomentTypeEnum.Timestamp
    ) {
      this.tsTimestampValueForm.controls['tsTimestampValue'].setValue(
        this.fraction.tsTimestampValue
      );
    }

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

    this.emitFractionUpdate();
  }

  fromMomentChange() {}

  toMomentChange() {}

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

    if (this.fraction.type === common.FractionTypeEnum.TsIsBeginFor) {
      this.fraction = this.timeService.buildFractionBeginFor({
        fraction: this.fraction,
        dateValue: this.dateStr,
        timeValue: this.timeStr
      });

      this.emitFractionUpdate();
    }
  }

  dayOfWeekChange() {
    if (this.fraction.type === common.FractionTypeEnum.TsIsBeginFor) {
      this.fraction = this.timeService.buildFractionBeginFor({
        fraction: this.fraction,
        dateValue: this.dateStr,
        timeValue: this.timeStr
      });

      this.emitFractionUpdate();
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnDay) {
      this.fraction = this.timeService.buildFractionOnDay({
        fraction: this.fraction,
        dateValue: this.dateStr
      });

      this.emitFractionUpdate();
    }
  }

  timestampValueBlur() {
    let value = this.tsTimestampValueForm.controls['tsTimestampValue'].value;

    if (value === this.fraction.tsTimestampValue) {
      return;
    }

    this.fraction.tsTimestampValue = value;

    if (this.fraction.type === common.FractionTypeEnum.TsIsBeginFor) {
      this.fraction = this.timeService.buildFractionBeginFor({
        fraction: this.fraction,
        dateValue: this.dateStr,
        timeValue: this.timeStr
      });

      this.emitFractionUpdate();
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnTimestamp) {
      this.fraction = this.timeService.buildFractionOnTimestamp({
        fraction: this.fraction
      });

      this.emitFractionUpdate();
    }
  }

  agoFromNowQuantityBlur() {
    let value =
      this.tsMomentAgoFromNowQuantityForm.controls['tsMomentAgoFromNowQuantity']
        .value;

    if (Number(value) === this.fraction.tsMomentAgoFromNowQuantity) {
      return;
    }

    this.fraction.tsMomentAgoFromNowQuantity = Number(value);

    if (this.fraction.type === common.FractionTypeEnum.TsIsBeginFor) {
      this.fraction = this.timeService.buildFractionBeginFor({
        fraction: this.fraction,
        dateValue: this.dateStr,
        timeValue: this.timeStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnYear) {
      this.fraction = this.timeService.buildFractionOnYear({
        fraction: this.fraction,
        dateValue: this.dateStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnQuarter) {
      this.fraction = this.timeService.buildFractionOnQuarter({
        fraction: this.fraction,
        dateValue: this.dateStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnMonth) {
      this.fraction = this.timeService.buildFractionOnMonth({
        fraction: this.fraction,
        dateValue: this.dateStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnWeek) {
      this.fraction = this.timeService.buildFractionOnWeek({
        fraction: this.fraction,
        dateValue: this.dateStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnDay) {
      this.fraction = this.timeService.buildFractionOnDay({
        fraction: this.fraction,
        dateValue: this.dateStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnHour) {
      this.fraction = this.timeService.buildFractionOnHour({
        fraction: this.fraction,
        dateValue: this.dateStr,
        timeValue: this.timeStr
      });
    } else if (this.fraction.type === common.FractionTypeEnum.TsIsOnMinute) {
      this.fraction = this.timeService.buildFractionOnMinute({
        fraction: this.fraction,
        dateValue: this.dateStr,
        timeValue: this.timeStr
      });
    }

    this.emitFractionUpdate();
  }

  agoFromNowUnitChange() {
    if (this.fraction.type === common.FractionTypeEnum.TsIsBeginFor) {
      this.fraction = this.timeService.buildFractionBeginFor({
        fraction: this.fraction,
        dateValue: this.dateStr,
        timeValue: this.timeStr
      });
    }

    this.emitFractionUpdate();
  }

  forValueBlur() {
    let value = this.tsForValueForm.controls['tsForValue'].value;

    if (Number(value) === this.fraction.tsForValue) {
      return;
    }

    this.fraction.tsForValue = Number(value);

    this.fraction = this.timeService.buildFractionBeginFor({
      fraction: this.fraction,
      dateValue: this.dateStr,
      timeValue: this.timeStr
    });

    this.emitFractionUpdate();
  }

  tsForUnitChange() {
    this.fraction = this.timeService.buildFractionBeginFor({
      fraction: this.fraction,
      dateValue: this.dateStr,
      timeValue: this.timeStr
    });

    this.emitFractionUpdate();
  }

  emitFractionUpdate() {
    if (
      (this.fraction.type === common.FractionTypeEnum.TsIsInLast &&
        this.tsLastValueForm.valid === false) ||
      (this.fraction.type === common.FractionTypeEnum.TsIsInNext &&
        this.tsNextValueForm.valid === false) ||
      (this.fraction.tsMomentType ===
        common.FractionTsMomentTypeEnum.Timestamp &&
        this.tsTimestampValueForm.valid === false) ||
      (this.fraction.type === common.FractionTypeEnum.TsIsBeginFor &&
        this.tsForValueForm.valid === false) ||
      ([
        common.FractionTsMomentTypeEnum.Ago,
        common.FractionTsMomentTypeEnum.FromNow
      ].indexOf(this.fraction.tsMomentType) > 0 &&
        this.tsMomentAgoFromNowQuantityForm.valid === false)
    ) {
      return;
    }

    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }
}
