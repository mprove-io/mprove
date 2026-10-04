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
import type { TimeSpec } from '#common/types/shared/time/timespec';
import '@vaadin/date-picker';
import {
  DatePicker,
  DatePickerDate,
  DatePickerI18n
} from '@vaadin/date-picker';
import '@vaadin/time-picker';
import { TimePicker } from '@vaadin/time-picker';
import { COMMON_I18N } from '#common/constants/top-front';

import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { EventFractionUpdate } from '#common/types/front/fraction/event-fraction-update';
import { StructQuery } from '#front/app/queries/struct.query';
import { TimeService } from '#front/app/services/time.service';
import { ValidationService } from '#front/app/services/validation.service';
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

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;
  @Input() isMetrics: boolean;
  @Input() timeSpec?: TimeSpec;
  @Input() fieldTimeframe?: string;

  fieldTimeframeLevel: number = 0;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

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
      value: 'TsIsAnyValue',
      operator: 'Or',
      timeframeLevel: 0
    },
    {
      label: 'is in last',
      value: 'TsIsInLast',
      operator: 'Or',
      timeframeLevel: 0
    },
    {
      label: 'is on Day',
      value: 'TsIsOnDay',
      operator: 'Or',
      timeframeLevel: 5
    },
    {
      label: 'is on Week',
      value: 'TsIsOnWeek',
      operator: 'Or',
      timeframeLevel: 6
    },
    {
      label: 'is on Month',
      value: 'TsIsOnMonth',
      operator: 'Or',
      timeframeLevel: 7
    },
    {
      label: 'is on Quarter',
      value: 'TsIsOnQuarter',
      operator: 'Or',
      timeframeLevel: 8
    },
    {
      label: 'is on Year',
      value: 'TsIsOnYear',
      operator: 'Or',
      timeframeLevel: 9
    },
    {
      label: 'is on Hour',
      value: 'TsIsOnHour',
      operator: 'Or',
      timeframeLevel: 4
    },
    {
      label: 'is on Minute',
      value: 'TsIsOnMinute',
      operator: 'Or',
      timeframeLevel: 3
    },
    {
      label: 'is on Timestamp',
      value: 'TsIsOnTimestamp',
      operator: 'Or',
      timeframeLevel: 1
    },
    {
      label: 'is between',
      value: 'TsIsBetween',
      operator: 'Or',
      timeframeLevel: 0
    },
    {
      label: 'is in next',
      value: 'TsIsInNext',
      operator: 'Or',
      timeframeLevel: 0
    },
    {
      label: 'is after',
      value: 'TsIsAfter',
      operator: 'Or',
      timeframeLevel: 0
    },
    {
      label: 'is starting at',
      value: 'TsIsStarting',
      operator: 'Or',
      timeframeLevel: 0
    },
    {
      label: 'is beginning at',
      value: 'TsIsBeginFor',
      operator: 'Or',
      timeframeLevel: 0
    },
    {
      label: 'is before',
      value: 'TsIsBefore',
      operator: 'Or',
      timeframeLevel: 0
    },
    {
      label: 'is through',
      value: 'TsIsThrough',
      operator: 'Or',
      timeframeLevel: 0
    },
    {
      label: 'is null',
      value: 'TsIsNull',
      operator: 'Or',
      timeframeLevel: 0
    },
    {
      label: 'is not in last',
      value: 'TsIsNotInLast',
      operator: 'And',
      timeframeLevel: 0
    },
    {
      label: 'is not on Day',
      value: 'TsIsNotOnDay',
      operator: 'And',
      timeframeLevel: 5
    },
    {
      label: 'is not on Week',
      value: 'TsIsNotOnWeek',
      operator: 'And',
      timeframeLevel: 6
    },
    {
      label: 'is not on Month',
      value: 'TsIsNotOnMonth',
      operator: 'And',
      timeframeLevel: 7
    },
    {
      label: 'is not on Quarter',
      value: 'TsIsNotOnQuarter',
      operator: 'And',
      timeframeLevel: 8
    },
    {
      label: 'is not on Year',
      value: 'TsIsNotOnYear',
      operator: 'And',
      timeframeLevel: 9
    },
    {
      label: 'is not on Hour',
      value: 'TsIsNotOnHour',
      operator: 'And',
      timeframeLevel: 4
    },
    {
      label: 'is not on Minute',
      value: 'TsIsNotOnMinute',
      operator: 'And',
      timeframeLevel: 3
    },
    {
      label: 'is not on Timestamp',
      value: 'TsIsNotOnTimestamp',
      operator: 'And',
      timeframeLevel: 1
    },
    {
      label: 'is not between',
      value: 'TsIsNotBetween',
      operator: 'And',
      timeframeLevel: 0
    },
    {
      label: 'is not in next',
      value: 'TsIsNotInNext',
      operator: 'And',
      timeframeLevel: 0
    },
    // {
    //   label: 'is not after',
    //   value: FractionTypeEnum.TsIsNotAfter, // is through
    //   operator: FractionOperatorEnum.And,
    //   level: 0
    // },
    // {
    //   label: 'is not starting at',
    //   value: FractionTypeEnum.TsIsNotStarting, // is before
    //   operator: FractionOperatorEnum.And,
    //   level: 0
    // },
    {
      label: 'is not beginning at',
      value: 'TsIsNotBeginFor',
      operator: 'And',
      timeframeLevel: 0
    },
    // {
    //   label: 'is not before',
    //   value: FractionTypeEnum.TsIsNotBefore, // is starting
    //   operator: FractionOperatorEnum.And,
    //   level: 0
    // },
    // {
    //   label: 'is not through',
    //   value: FractionTypeEnum.TsIsNotThrough, // is after
    //   operator: FractionOperatorEnum.And,
    //   level: 0
    // },
    {
      label: 'is not null',
      value: 'TsIsNotNull',
      operator: 'And',
      timeframeLevel: 0
    }
  ];

  fractionTsMomentTypesList: FractionTsMomentTypesItem[] = [];
  fractionTsMomentTypesFullList: FractionTsMomentTypesItem[] = [
    {
      label: 'calendar',
      value: 'Literal'
    },
    {
      label: 'today',
      value: 'Today'
    },
    {
      label: 'yesterday',
      value: 'Yesterday'
    },
    {
      label: 'tomorrow',
      value: 'Tomorrow'
    },
    {
      label: 'this',
      value: 'This'
    },
    {
      label: 'last',
      value: 'Last'
    },
    {
      label: 'next',
      value: 'Next'
    },
    {
      label: 'ago',
      value: 'Ago'
    },
    {
      label: 'from now',
      value: 'FromNow'
    },
    {
      label: 'now',
      value: 'Now'
    },
    {
      label: 'timestamp',
      value: 'Timestamp'
    }
  ];

  fractionTsOnUnitsList: FractionTsMixUnitItem[] = [];
  fractionTsAgoFromNowUnitsList: FractionTsMixUnitItem[] = [];
  fractionTsOnDayUnitsList: FractionTsMixUnitItem[] = [];
  fractionTsLiteralUnitsList: FractionTsMixUnitItem[] = [];

  fractionTsMixUnitsTempList: FractionTsMixUnitItem[] = [
    {
      label: 'day',
      value: 'day',
      timeframeLevel: 5
    },
    {
      label: 'week',
      value: 'week',
      timeframeLevel: 6
    },
    {
      label: 'month',
      value: 'month',
      timeframeLevel: 7
    },
    {
      label: 'quarter',
      value: 'quarter',
      timeframeLevel: 8
    },
    {
      label: 'year',
      value: 'year',
      timeframeLevel: 9
    },
    {
      label: 'hour',
      value: 'hour',
      timeframeLevel: 4
    },
    {
      label: 'minute',
      value: 'minute',
      timeframeLevel: 3
    },
    {
      label: 'second',
      value: 'second',
      timeframeLevel: 2
    }
  ];

  fractionTsMixUnitsDayOfWeekSundayList: FractionTsMixUnitItem[] = [
    {
      label: 'Sunday',
      value: 'sunday',
      timeframeLevel: 5
    },
    {
      label: 'Monday',
      value: 'monday',
      timeframeLevel: 5
    },
    {
      label: 'Tuesday',
      value: 'tuesday',
      timeframeLevel: 5
    },
    {
      label: 'Wednesday',
      value: 'wednesday',
      timeframeLevel: 5
    },
    {
      label: 'Thursday',
      value: 'thursday',
      timeframeLevel: 5
    },
    {
      label: 'Friday',
      value: 'friday',
      timeframeLevel: 5
    },
    {
      label: 'Saturday',
      value: 'saturday',
      timeframeLevel: 5
    }
  ];

  fractionTsMixUnitsDayOfWeekMondayList: FractionTsMixUnitItem[] = [
    {
      label: 'Monday',
      value: 'monday',
      timeframeLevel: 5
    },
    {
      label: 'Tuesday',
      value: 'tuesday',
      timeframeLevel: 5
    },
    {
      label: 'Wednesday',
      value: 'wednesday',
      timeframeLevel: 5
    },
    {
      label: 'Thursday',
      value: 'thursday',
      timeframeLevel: 5
    },
    {
      label: 'Friday',
      value: 'friday',
      timeframeLevel: 5
    },
    {
      label: 'Saturday',
      value: 'saturday',
      timeframeLevel: 5
    },
    {
      label: 'Sunday',
      value: 'sunday',
      timeframeLevel: 5
    }
  ];

  fractionTsLastNextUnitsList: FractionTsUnitItem[] = [];
  fractionTsForUnitsList: FractionTsUnitItem[] = [];
  fractionTsUnitsFullList: FractionTsUnitItem[] = [
    {
      label: 'days',
      value: 'days',
      timeframeLevel: 5
    },
    {
      label: 'weeks',
      value: 'weeks',
      timeframeLevel: 6
    },
    {
      label: 'months',
      value: 'months',
      timeframeLevel: 7
    },
    {
      label: 'quarters',
      value: 'quarters',
      timeframeLevel: 8
    },
    {
      label: 'years',
      value: 'years',
      timeframeLevel: 9
    },
    {
      label: 'hours',
      value: 'hours',
      timeframeLevel: 4
    },
    {
      label: 'minutes',
      value: 'minutes',
      timeframeLevel: 3
    },
    {
      label: 'seconds',
      value: 'seconds',
      timeframeLevel: 2
    }
  ];

  fractionTsLastCompleteOptionsList: FractionTsLastCompleteOptionItem[] = [
    {
      label: 'completed with current',
      value: 'CompleteWithCurrent'
    },
    {
      label: 'completed',
      value: 'Complete'
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
                'TsIsInLast',
                'TsIsOnDay',
                'TsIsOnWeek',
                'TsIsOnMonth',
                'TsIsOnQuarter',
                'TsIsOnYear',
                'TsIsInNext',
                'TsIsAfter',
                'TsIsStarting',
                'TsIsBeginFor',
                'TsIsBetween',
                'TsIsBefore',
                'TsIsThrough',
                'TsIsOnHour',
                'TsIsOnMinute'
              ].indexOf(x.value) > -1
          );

    let structState = this.structQuery.getValue();

    let dowMixList =
      structState.mproveConfig.weekStart === 'Monday'
        ? this.fractionTsMixUnitsDayOfWeekMondayList
        : this.fractionTsMixUnitsDayOfWeekSundayList;

    this.fractionTsOnUnitsList = [
      ...this.fractionTsMixUnitsTempList,
      ...dowMixList
    ];

    this.fractionTsOnDayUnitsList = [
      ...this.fractionTsMixUnitsTempList.filter(x => x.value === 'day'),
      ...dowMixList
    ];

    this.fractionTsLiteralUnitsList = [
      ...this.fractionTsMixUnitsTempList.filter(x => x.value !== 'second')
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
      structState.mproveConfig.weekStart === 'Monday' ? 1 : 0;

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
    if (isDefined(this.fieldTimeframe)) {
      this.timeSpec = (this.fieldTimeframe + 's') as TimeSpec;
    }

    this.fieldTimeframeLevel = isUndefined(this.timeSpec)
      ? 0
      : this.timeSpec === 'timestamps'
        ? 1
        : this.timeSpec === 'minutes'
          ? 3
          : this.timeSpec === 'hours'
            ? 4
            : this.timeSpec === 'days'
              ? 5
              : this.timeSpec === 'weeks'
                ? 6
                : this.timeSpec === 'months'
                  ? 7
                  : this.timeSpec === 'quarters'
                    ? 8
                    : this.timeSpec === 'years'
                      ? 9
                      : 0;

    if (isDefined(changes.fraction)) {
      if (
        [
          'TsIsOnYear',
          'TsIsOnQuarter',
          'TsIsOnMonth',
          'TsIsOnWeek',
          'TsIsOnHour',
          'TsIsOnMinute',
          'TsIsNotOnYear',
          'TsIsNotOnQuarter',
          'TsIsNotOnMonth',
          'TsIsNotOnWeek',
          'TsIsNotOnHour',
          'TsIsNotOnMinute'
        ].indexOf((changes.fraction.currentValue as Fraction).type) > -1
      ) {
        this.fractionTsMomentTypesList =
          this.fractionTsMomentTypesFullList.filter(
            x =>
              ['Literal', 'This', 'Last', 'Next', 'Ago', 'FromNow'].indexOf(
                x.value
              ) > -1
          );
      } else if (
        ['TsIsOnDay', 'TsIsNotOnDay'].indexOf(
          (changes.fraction.currentValue as Fraction).type
        ) > -1
      ) {
        this.fractionTsMomentTypesList =
          this.fractionTsMomentTypesFullList.filter(
            x =>
              [
                'Literal',
                'Today',
                'Yesterday',
                'Tomorrow',
                'This',
                'Last',
                'Next',
                'Ago',
                'FromNow'
              ].indexOf(x.value) > -1
          );
      } else if (
        ['TsIsOnTimestamp', 'TsIsNotOnTimestamp'].indexOf(
          (changes.fraction.currentValue as Fraction).type
        ) > -1
      ) {
        this.fractionTsMomentTypesList =
          this.fractionTsMomentTypesFullList.filter(
            x => ['Timestamp', 'Now'].indexOf(x.value) > -1
          );
      } else if (
        [
          'TsIsBefore',
          'TsIsThrough',
          'TsIsAfter',
          'TsIsStarting',
          'TsIsBeginFor',
          'TsIsNotBeginFor'
        ].indexOf((changes.fraction.currentValue as Fraction).type) > -1
      ) {
        this.fractionTsMomentTypesList =
          this.fractionTsMomentTypesFullList.filter(
            x =>
              [
                'Literal',
                'Today',
                'Yesterday',
                'Tomorrow',
                'This',
                'Last',
                'Next',
                'Ago',
                'FromNow',
                'Now',
                'Timestamp'
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
      (isUndefined(this.fraction.tsDateYear) &&
        isUndefined(this.fraction.tsDateQuarter) &&
        isUndefined(this.fraction.tsDateMonth) &&
        isUndefined(this.fraction.tsDateDay) &&
        isUndefined(this.fraction.tsDateHour) &&
        isUndefined(this.fraction.tsDateMinute));

    let now = new Date();

    let year =
      useNow === true
        ? now.getFullYear()
        : useFraction === true && isDefined(this.fraction.tsDateYear)
          ? this.fraction.tsDateYear
          : 2020;

    let month =
      useNow === true
        ? now.getMonth() + 1
        : useFraction === true &&
            isUndefined(this.fraction.tsDateMonth) &&
            isDefined(this.fraction.tsDateQuarter)
          ? this.fraction.tsDateQuarter === 1
            ? 1
            : this.fraction.tsDateQuarter === 2
              ? 4
              : this.fraction.tsDateQuarter === 3
                ? 7
                : this.fraction.tsDateQuarter === 4
                  ? 10
                  : undefined
          : useFraction === true && isDefined(this.fraction.tsDateMonth)
            ? this.fraction.tsDateMonth
            : 1;

    let day =
      useNow === true
        ? now.getDate()
        : useFraction === true && isDefined(this.fraction.tsDateDay)
          ? this.fraction.tsDateDay
          : 1;

    let hour =
      useNow === true
        ? 0
        : useFraction === true && isDefined(this.fraction.tsDateHour)
          ? this.fraction.tsDateHour
          : 0;

    let minute =
      useNow === true
        ? 0
        : useFraction === true && isDefined(this.fraction.tsDateMinute)
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
      (isUndefined(this.fraction.tsDateToYear) &&
        isUndefined(this.fraction.tsDateToQuarter) &&
        isUndefined(this.fraction.tsDateToMonth) &&
        isUndefined(this.fraction.tsDateToDay) &&
        isUndefined(this.fraction.tsDateToHour) &&
        isUndefined(this.fraction.tsDateToMinute));

    let nowPlusOneDay = new Date();

    nowPlusOneDay.setDate(nowPlusOneDay.getDate() + 1);

    let year =
      useNowPlusOneDay === true
        ? nowPlusOneDay.getFullYear()
        : useFraction === true && isDefined(this.fraction.tsDateToYear)
          ? this.fraction.tsDateToYear
          : 2020;

    let month =
      useNowPlusOneDay === true
        ? nowPlusOneDay.getMonth() + 1
        : useFraction === true &&
            isUndefined(this.fraction.tsDateToMonth) &&
            isDefined(this.fraction.tsDateToQuarter)
          ? this.fraction.tsDateToQuarter === 1
            ? 1
            : this.fraction.tsDateToQuarter === 2
              ? 4
              : this.fraction.tsDateToQuarter === 3
                ? 7
                : this.fraction.tsDateToQuarter === 4
                  ? 10
                  : undefined
          : useFraction === true && isDefined(this.fraction.tsDateToMonth)
            ? this.fraction.tsDateToMonth
            : 1;

    let day =
      useNowPlusOneDay === true
        ? nowPlusOneDay.getDate()
        : useFraction === true && isDefined(this.fraction.tsDateToDay)
          ? this.fraction.tsDateToDay
          : 1;

    let hour =
      useNowPlusOneDay === true
        ? 0
        : useFraction === true && isDefined(this.fraction.tsDateToHour)
          ? this.fraction.tsDateToHour
          : 0;

    let minute =
      useNowPlusOneDay === true
        ? 0
        : useFraction === true && isDefined(this.fraction.tsDateToMinute)
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
      case 'TsIsAnyValue': {
        break;
      }

      case 'TsIsInLast':
      case 'TsIsNotInLast': {
        this.fraction.tsLastValue = 5;
        this.fraction.tsLastUnit = 'days';
        this.fraction.tsLastCompleteOption = 'CompleteWithCurrent';
        break;
      }

      case 'TsIsOnDay':
      case 'TsIsNotOnDay': {
        this.fraction.tsMomentType = 'Literal';
        this.fraction.tsMomentUnit = 'day';
        break;
      }

      case 'TsIsOnWeek':
      case 'TsIsNotOnWeek': {
        this.fraction.tsMomentType = 'Literal';
        this.fraction.tsMomentUnit = 'week';

        this.dateStr = this.timeService.getWeekStartDate({
          dateValue: this.dateStr
        });
        break;
      }

      case 'TsIsOnMonth':
      case 'TsIsNotOnMonth': {
        this.fraction.tsMomentType = 'Literal';
        this.fraction.tsMomentUnit = 'month';
        break;
      }

      case 'TsIsOnQuarter':
      case 'TsIsNotOnQuarter': {
        this.fraction.tsMomentType = 'Literal';
        this.fraction.tsMomentUnit = 'quarter';

        this.dateStr = this.timeService.getQuarterStartDate({
          dateValue: this.dateStr
        });
        break;
      }

      case 'TsIsOnYear':
      case 'TsIsNotOnYear': {
        this.fraction.tsMomentType = 'Literal';
        this.fraction.tsMomentUnit = 'year';
        break;
      }

      case 'TsIsInNext':
      case 'TsIsNotInNext': {
        this.fraction.tsNextValue = 5;
        this.fraction.tsNextUnit = 'days';
        break;
      }

      case 'TsIsAfter': {
        this.fraction.tsMomentType = 'Literal';
        this.fraction.tsMomentUnit = 'day';
        break;
      }

      case 'TsIsStarting': {
        this.fraction.tsMomentType = 'Literal';
        this.fraction.tsMomentUnit = 'day';
        break;
      }

      case 'TsIsBeginFor':
      case 'TsIsNotBeginFor': {
        this.fraction.tsMomentType = 'Literal';
        this.fraction.tsMomentUnit = 'day';

        this.fraction.tsForValue = 1;
        this.fraction.tsForUnit = 'weeks';
        break;
      }

      case 'TsIsBetween':
      case 'TsIsNotBetween': {
        this.fraction.tsFromMomentType = 'Literal';
        this.fraction.tsFromMomentAgoFromNowQuantity = 1;
        this.fraction.tsFromMomentUnit = 'day';

        this.fraction.tsToMomentType = 'Literal';
        this.fraction.tsToMomentAgoFromNowQuantity = 1;
        this.fraction.tsToMomentUnit = 'day';
        break;
      }

      case 'TsIsBefore': {
        this.fraction.tsMomentType = 'Literal';
        this.fraction.tsMomentUnit = 'day';
        break;
      }

      case 'TsIsThrough': {
        this.fraction.tsMomentType = 'Literal';
        this.fraction.tsMomentUnit = 'day';
        break;
      }

      case 'TsIsOnHour':
      case 'TsIsNotOnHour': {
        this.fraction.tsMomentType = 'Literal';
        this.fraction.tsMomentUnit = 'hour';
        break;
      }

      case 'TsIsOnMinute':
      case 'TsIsNotOnMinute': {
        this.fraction.tsMomentType = 'Literal';
        this.fraction.tsMomentUnit = 'minute';
        break;
      }

      case 'TsIsOnTimestamp':
      case 'TsIsNotOnTimestamp': {
        this.fraction.tsMomentType = 'Timestamp';
        this.fraction.tsMomentUnit = undefined; // for getMomentStr
        this.fraction.tsTimestampValue = this.timeService.getTimestampUtc();
        break;
      }

      case 'TsIsNull':
      case 'TsIsNotNull': {
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
      this.fraction.type === 'TsIsInLast' ||
      this.fraction.type === 'TsIsNotInLast'
    ) {
      this.tsLastValueForm.controls['tsLastValue'].setValue(
        this.fraction.tsLastValue
      );
    }

    if (
      this.fraction.type === 'TsIsInNext' ||
      this.fraction.type === 'TsIsNotInNext'
    ) {
      this.tsNextValueForm.controls['tsNextValue'].setValue(
        this.fraction.tsNextValue
      );
    }

    if (
      this.fraction.type === 'TsIsBeginFor' ||
      this.fraction.type === 'TsIsNotBeginFor'
    ) {
      this.tsForValueForm.controls['tsForValue'].setValue(
        this.fraction.tsForValue
      );
    }

    if (
      this.fraction.type === 'TsIsOnTimestamp' ||
      this.fraction.type === 'TsIsNotOnTimestamp'
    ) {
      this.tsTimestampValueForm.controls['tsTimestampValue'].setValue(
        this.fraction.tsTimestampValue
      );
    }

    this.emitFractionUpdate();
  }

  yearDateValueChanged(x: any) {
    let datePickerOnYear = this.datePickerOnYear?.nativeElement;

    if (isDefinedAndNotEmpty(datePickerOnYear?.value)) {
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

    if (isDefinedAndNotEmpty(datePickerOnQuarter?.value)) {
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

    if (isDefinedAndNotEmpty(datePickerOnMonth?.value)) {
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

    if (isDefinedAndNotEmpty(datePickerOnWeek?.value)) {
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

    if (isDefinedAndNotEmpty(datePickerOnDay?.value)) {
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

    if (isDefinedAndNotEmpty(datePickerOnHour?.value)) {
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

    if (isDefinedAndNotEmpty(timePickerOnHour?.value)) {
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
      if (isDefined(timePickerOnHour) && timePickerOnHour.opened === false) {
        timePickerOnHour.blur();
      }
    }, 1);
  }

  minuteDateValueChanged(x: any) {
    let datePickerOnMinute = this.datePickerOnMinute?.nativeElement;
    if (isDefinedAndNotEmpty(datePickerOnMinute?.value)) {
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

    if (isDefinedAndNotEmpty(timePickerOnMinute?.value)) {
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
        isDefined(timePickerOnMinute) &&
        timePickerOnMinute.opened === false
      ) {
        timePickerOnMinute.blur();
      }
    }, 1);
  }

  betweenFromDateValueChanged(x: any) {
    let datePickerBetweenFrom = this.datePickerBetweenFrom?.nativeElement;
    if (isDefined(datePickerBetweenFrom)) {
      let value = datePickerBetweenFrom.value;

      if (isDefinedAndNotEmpty(value)) {
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
    if (isDefined(timePickerBetweenFrom)) {
      let value = timePickerBetweenFrom.value;

      if (isDefinedAndNotEmpty(value)) {
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
        isDefined(timePickerBetweenFrom) &&
        timePickerBetweenFrom.opened === false
      ) {
        timePickerBetweenFrom.blur();
      }
    }, 1);
  }

  betweenToDateValueChanged(x: any) {
    let datePickerBetweenTo = this.datePickerBetweenTo?.nativeElement;
    if (isDefined(datePickerBetweenTo)) {
      let value = datePickerBetweenTo.value;

      if (isDefinedAndNotEmpty(value)) {
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
    if (isDefined(timePickerBetweenTo)) {
      let value = timePickerBetweenTo.value;

      if (isDefinedAndNotEmpty(value)) {
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
        isDefined(timePickerBetweenTo) &&
        timePickerBetweenTo.opened === false
      ) {
        timePickerBetweenTo.blur();
      }
    }, 1);
  }

  beforeValueChanged(x: any) {
    let datePickerBefore = this.datePickerBefore?.nativeElement;
    if (isDefined(datePickerBefore)) {
      let value = datePickerBefore.value;

      if (isDefinedAndNotEmpty(value)) {
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
    if (isDefined(timePickerBefore)) {
      let value = timePickerBefore.value;

      if (isDefinedAndNotEmpty(value)) {
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
      if (isDefined(timePickerBefore) && timePickerBefore.opened === false) {
        timePickerBefore.blur();
      }
    }, 1);
  }

  throughDateValueChanged(x: any) {
    let datePickerThrough = this.datePickerThrough?.nativeElement;
    if (isDefined(datePickerThrough)) {
      let value = datePickerThrough.value;

      if (isDefinedAndNotEmpty(value)) {
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
    if (isDefined(timePickerThrough)) {
      let value = timePickerThrough.value;

      if (isDefinedAndNotEmpty(value)) {
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
      if (isDefined(timePickerThrough) && timePickerThrough.opened === false) {
        timePickerThrough.blur();
      }
    }, 1);
  }

  afterValueChanged(x: any) {
    let datePickerAfter = this.datePickerAfter?.nativeElement;
    if (isDefined(datePickerAfter)) {
      let value = datePickerAfter.value;

      if (isDefinedAndNotEmpty(value)) {
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
    if (isDefined(timePickerAfter)) {
      let value = timePickerAfter.value;

      if (isDefinedAndNotEmpty(value)) {
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
      if (isDefined(timePickerAfter) && timePickerAfter.opened === false) {
        timePickerAfter.blur();
      }
    }, 1);
  }

  startingDateValueChanged(x: any) {
    let datePickerStarting = this.datePickerStarting?.nativeElement;
    if (isDefined(datePickerStarting)) {
      let value = datePickerStarting.value;

      if (isDefinedAndNotEmpty(value)) {
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
    if (isDefined(timePickerStarting)) {
      let value = timePickerStarting.value;

      if (isDefinedAndNotEmpty(value)) {
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
        isDefined(timePickerStarting) &&
        timePickerStarting.opened === false
      ) {
        timePickerStarting.blur();
      }
    }, 1);
  }

  beginForDateValueChanged(x: any) {
    let datePickerBeginFor = this.datePickerBeginFor?.nativeElement;
    if (isDefined(datePickerBeginFor)) {
      let value = datePickerBeginFor.value;

      if (isDefinedAndNotEmpty(value)) {
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
    if (isDefined(timePickerBeginFor)) {
      let value = timePickerBeginFor.value;

      if (isDefinedAndNotEmpty(value)) {
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
        isDefined(timePickerBeginFor) &&
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
    if (this.fraction.tsMomentType === 'Timestamp') {
      this.fraction.tsTimestampValue = this.timeService.getTimestampUtc();
    }

    this.fraction.tsMomentUnit =
      this.fraction.tsMomentType === 'Now' ||
      this.fraction.tsMomentType === 'Timestamp'
        ? undefined
        : this.fractionTsMixUnitsTempList
              .map(x => x.value)
              .indexOf(this.fraction.tsMomentUnit) > -1
          ? this.fraction.tsMomentUnit
          : 'day';

    if (['Ago', 'FromNow'].indexOf(this.fraction.tsMomentType) > -1) {
      this.fraction.tsMomentAgoFromNowQuantity = 1;
    }

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    if (['Ago', 'FromNow'].indexOf(this.fraction.tsMomentType) > -1) {
      this.tsMomentAgoFromNowQuantityForm.controls[
        'tsMomentAgoFromNowQuantity'
      ].setValue(this.fraction.tsMomentAgoFromNowQuantity);
    }

    if (this.fraction.tsMomentType === 'Timestamp') {
      this.tsTimestampValueForm.controls['tsTimestampValue'].setValue(
        this.fraction.tsTimestampValue
      );
    }

    this.emitFractionUpdate();
  }

  betweenFromMomentChange() {
    if (this.fraction.tsFromMomentType === 'Timestamp') {
      this.fraction.tsFromTimestampValue = this.timeService.getTimestampUtc();
    }

    this.fraction.tsFromMomentUnit =
      this.fraction.tsFromMomentType === 'Now' ||
      this.fraction.tsFromMomentType === 'Timestamp'
        ? undefined
        : this.fractionTsMixUnitsTempList
              .map(x => x.value)
              .indexOf(this.fraction.tsFromMomentUnit) > -1
          ? this.fraction.tsFromMomentUnit
          : 'day';

    if (['Ago', 'FromNow'].indexOf(this.fraction.tsFromMomentType) > -1) {
      this.fraction.tsFromMomentAgoFromNowQuantity = 1;
    }

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    if (['Ago', 'FromNow'].indexOf(this.fraction.tsFromMomentType) > -1) {
      this.tsFromMomentAgoFromNowQuantityForm.controls[
        'tsFromMomentAgoFromNowQuantity'
      ].setValue(this.fraction.tsFromMomentAgoFromNowQuantity);
    }

    if (this.fraction.tsFromMomentType === 'Timestamp') {
      this.tsFromTimestampValueForm.controls['tsFromTimestampValue'].setValue(
        this.fraction.tsFromTimestampValue
      );
    }

    this.emitFractionUpdate();
  }

  betweenToMomentChange() {
    if (this.fraction.tsToMomentType === 'Timestamp') {
      this.fraction.tsToTimestampValue = this.timeService.getTimestampUtc();
    }

    this.fraction.tsToMomentUnit =
      this.fraction.tsToMomentType === 'Now' ||
      this.fraction.tsToMomentType === 'Timestamp'
        ? undefined
        : this.fractionTsMixUnitsTempList
              .map(x => x.value)
              .indexOf(this.fraction.tsToMomentUnit) > -1
          ? this.fraction.tsToMomentUnit
          : 'day';

    if (['Ago', 'FromNow'].indexOf(this.fraction.tsToMomentType) > -1) {
      this.fraction.tsToMomentAgoFromNowQuantity = 1;
    }

    this.fraction = this.timeService.buildFraction({
      fraction: this.fraction,
      dateStr: this.dateStr,
      timeStr: this.timeStr,
      dateToStr: this.dateToStr,
      timeToStr: this.timeToStr
    });

    if (['Ago', 'FromNow'].indexOf(this.fraction.tsToMomentType) > -1) {
      this.tsToMomentAgoFromNowQuantityForm.controls[
        'tsToMomentAgoFromNowQuantity'
      ].setValue(this.fraction.tsToMomentAgoFromNowQuantity);
    }

    if (this.fraction.tsToMomentType === 'Timestamp') {
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
      (['TsIsInLast', 'TsIsNotInLast'].indexOf(this.fraction.type) > -1 &&
        this.tsLastValueForm.valid === false) ||
      (['TsIsInNext', 'TsIsNotInNext'].indexOf(this.fraction.type) > -1 &&
        this.tsNextValueForm.valid === false) ||
      (['TsIsBeginFor', 'TsIsNotBeginFor'].indexOf(this.fraction.type) > -1 &&
        this.tsForValueForm.valid === false) ||
      (this.fraction.tsMomentType === 'Timestamp' &&
        this.tsTimestampValueForm.valid === false) ||
      (['Ago', 'FromNow'].indexOf(this.fraction.tsMomentType) > -1 &&
        this.tsMomentAgoFromNowQuantityForm.valid === false) ||
      (['TsIsBetween', 'TsIsNotBetween'].indexOf(this.fraction.type) > -1 &&
        ((this.fraction.tsFromMomentType === 'Timestamp' &&
          this.tsFromTimestampValueForm.valid === false) ||
          (this.fraction.tsToMomentType === 'Timestamp' &&
            this.tsToTimestampValueForm.valid === false) ||
          (['Ago', 'FromNow'].indexOf(this.fraction.tsFromMomentType) > -1 &&
            this.tsFromMomentAgoFromNowQuantityForm.valid === false) ||
          (['Ago', 'FromNow'].indexOf(this.fraction.tsToMomentType) > -1 &&
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
