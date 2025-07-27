import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
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
import { tap } from 'rxjs';
import { MALLOY_FILTER_ANY } from '~common/constants/top';
import { COMMON_I18N } from '~front/app/constants/top';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { TimeService } from '~front/app/services/time.service';
import { UiService } from '~front/app/services/ui.service';
import { ValidationService } from '~front/app/services/validation.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import {
  FractionTsForOptionItem,
  FractionTsForUnitItem,
  FractionTsLastCompleteOptionItem,
  FractionTsLastUnitItem,
  FractionTsMomentTypesItem,
  FractionTsNextUnitItem,
  FractionTsRelativeCompleteOptionItem,
  FractionTsRelativeUnitItem,
  FractionTsRelativeWhenOptionItem,
  FractionTypeItem
} from '../fraction.component';

@Component({
  standalone: false,
  selector: 'm-fraction-ts',
  templateUrl: 'fraction-ts.component.html',
  styleUrls: ['fraction-ts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionTsComponent implements OnInit {
  @ViewChild('fractionTsTypeSelect', { static: false })
  fractionTsTypeSelectElement: NgSelectComponent;

  @ViewChild('tsRelativeUnitSelect', { static: false })
  tsRelativeUnitSelectElement: NgSelectComponent;

  @ViewChild('tsRelativeCompleteOptionsSelect', { static: false })
  tsRelativeCompleteOptionsSelectElement: NgSelectComponent;

  @ViewChild('tsRelativeWhenOptionsSelect', { static: false })
  tsRelativeWhenOptionsSelectElement: NgSelectComponent;

  @ViewChild('tsForOptionsSelect', { static: false })
  tsForOptionsSelectElement: NgSelectComponent;

  @ViewChild('tsForUnitsSelect', { static: false })
  tsForUnitsSelectElement: NgSelectComponent;

  @ViewChild('tsLastUnitsSelect', { static: false })
  tsLastUnitsSelectElement: NgSelectComponent;

  @ViewChild('tsLastCompleteOptionsSelect', { static: false })
  tsLastCompleteOptionsSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionTsTypeSelectElement?.close();
    this.tsRelativeUnitSelectElement?.close();
    this.tsRelativeCompleteOptionsSelectElement?.close();
    this.tsRelativeWhenOptionsSelectElement?.close();
    this.tsForOptionsSelectElement?.close();
    this.tsForUnitsSelectElement?.close();
    this.tsLastUnitsSelectElement?.close();
    this.tsLastCompleteOptionsSelectElement?.close();
  }

  fractionTypeEnum = common.FractionTypeEnum;
  fractionTsForOptionEnum = common.FractionTsForOptionEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;
  @Input() isMetrics: boolean;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  @ViewChild('datePickerOnYear') datePickerOnYear: ElementRef<DatePicker>;
  @ViewChild('datePickerOnMonth') datePickerOnMonth: ElementRef<DatePicker>;
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

  tsRelativeValueForm: FormGroup;
  tsForValueForm: FormGroup;
  tsLastValueForm: FormGroup;
  tsNextValueForm: FormGroup;

  fractionTsTypesList: FractionTypeItem[] = [
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
      label: 'is on Year',
      value: common.FractionTypeEnum.TsIsOnYear,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is on Quarter',
      value: common.FractionTypeEnum.TsIsOnQuarter,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is on Month',
      value: common.FractionTypeEnum.TsIsOnMonth,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is on Week',
      value: common.FractionTypeEnum.TsIsOnWeek,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is on Day',
      value: common.FractionTypeEnum.TsIsOnDay,
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
      label: 'is after',
      value: common.FractionTypeEnum.TsIsAfterDate,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is starting',
      value: common.FractionTypeEnum.TsIsStarting,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is starting ... for',
      value: common.FractionTypeEnum.TsIsBeginFor,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is in next',
      value: common.FractionTypeEnum.TsIsInNext,
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
      label: 'is not on Year',
      value: common.FractionTypeEnum.TsIsNotOnYear,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not on Quarter',
      value: common.FractionTypeEnum.TsIsNotOnQuarter,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not on Month',
      value: common.FractionTypeEnum.TsIsNotOnMonth,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not on Week',
      value: common.FractionTypeEnum.TsIsNotOnWeek,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not on Day',
      value: common.FractionTypeEnum.TsIsNotOnDay,
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
    // {
    //   label: 'is not after',
    //   value: common.FractionTypeEnum.TsIsNotAfterDate, // is through
    //   operator: common.FractionOperatorEnum.And
    // },
    // {
    //   label: 'is not starting',
    //   value: common.FractionTypeEnum.TsIsNotStarting, // is before // not supported (malloy issue)
    //   operator: common.FractionOperatorEnum.And
    // },
    {
      label: 'is not starting ... for',
      value: common.FractionTypeEnum.TsIsNotBeginFor,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not in next',
      value: common.FractionTypeEnum.TsIsNotInNext,
      operator: common.FractionOperatorEnum.And
    },
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

  fractionTsRelativeCompleteOptionsList: FractionTsRelativeCompleteOptionItem[] =
    [
      {
        label: 'complete',
        value: common.FractionTsRelativeCompleteOptionEnum.Complete
      },
      {
        label: 'not complete',
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

  fractionTsLastUnitsList: FractionTsLastUnitItem[] = [
    {
      label: 'Years',
      value: common.FractionTsLastUnitEnum.Years
    },
    {
      label: 'Quarters',
      value: common.FractionTsLastUnitEnum.Quarters
    },
    {
      label: 'Months',
      value: common.FractionTsLastUnitEnum.Months
    },
    {
      label: 'Weeks',
      value: common.FractionTsLastUnitEnum.Weeks
    },
    {
      label: 'Days',
      value: common.FractionTsLastUnitEnum.Days
    },
    {
      label: 'Hours',
      value: common.FractionTsLastUnitEnum.Hours
    },
    {
      label: 'Minutes',
      value: common.FractionTsLastUnitEnum.Minutes
    }
  ];

  fractionTsNextUnitsList: FractionTsNextUnitItem[] = [
    {
      label: 'Years',
      value: common.FractionTsNextUnitEnum.Years
    },
    {
      label: 'Quarters',
      value: common.FractionTsNextUnitEnum.Quarters
    },
    {
      label: 'Months',
      value: common.FractionTsNextUnitEnum.Months
    },
    {
      label: 'Weeks',
      value: common.FractionTsNextUnitEnum.Weeks
    },
    {
      label: 'Days',
      value: common.FractionTsNextUnitEnum.Days
    },
    {
      label: 'Hours',
      value: common.FractionTsNextUnitEnum.Hours
    },
    {
      label: 'Minutes',
      value: common.FractionTsNextUnitEnum.Minutes
    }
  ];

  fractionTsLastCompleteOptionsList: FractionTsLastCompleteOptionItem[] = [
    {
      label: 'complete plus current',
      value: common.FractionTsLastCompleteOptionEnum.CompletePlusCurrent
    },
    {
      label: 'complete',
      value: common.FractionTsLastCompleteOptionEnum.Complete
    },
    {
      label: 'not complete',
      value: common.FractionTsLastCompleteOptionEnum.Incomplete
    }
  ];

  fractionTsMomentTypesList: FractionTsMomentTypesItem[] = [
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
      label: 'this day of week',
      value: common.FractionTsMomentTypeEnum.ThisDayOfWeek
    },
    {
      label: 'last day of week',
      value: common.FractionTsMomentTypeEnum.LastDayOfWeek
    },
    {
      label: 'next day of week',
      value: common.FractionTsMomentTypeEnum.NextDayOfWeek
    },
    {
      label: 'now',
      value: common.FractionTsMomentTypeEnum.Now
    },
    {
      label: 'ago',
      value: common.FractionTsMomentTypeEnum.Ago
    },
    {
      label: 'from now',
      value: common.FractionTsMomentTypeEnum.FromNow
    }
  ];

  commonI18n: DatePickerI18n = COMMON_I18N;

  onYearDateI18n = Object.assign({}, this.commonI18n);
  onMonthDateI18n = Object.assign({}, this.commonI18n);
  onDayDateI18n = Object.assign({}, this.commonI18n);
  onHourDateI18n = Object.assign({}, this.commonI18n);
  onMinuteDateI18n = Object.assign({}, this.commonI18n);
  beforeDateI18n = Object.assign({}, this.commonI18n);
  throughI18n = Object.assign({}, this.commonI18n);
  afterDateI18n = Object.assign({}, this.commonI18n);
  startingI18n = Object.assign({}, this.commonI18n);
  beginForI18n = Object.assign({}, this.commonI18n);
  inRangeFromDateI18n = Object.assign({}, this.commonI18n);
  inRangeToDateI18n = Object.assign({}, this.commonI18n);

  dateStr: string;
  dateToStr: string;

  timeStr: string;
  timeToStr: string;

  zeroHoursMinutes = '00:00:00';
  showHours: boolean;

  showHours$ = this.uiQuery.showHours$.pipe(
    tap(showHours => (this.showHours = showHours))
  );

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
    this.fractionTsTypesList = this.fractionTsTypesList.filter(x => {
      if (this.isMetrics === true) {
        return (
          [
            common.FractionTypeEnum.TsIsAnyValue,
            common.FractionTypeEnum.TsIsNull,
            common.FractionTypeEnum.TsIsNotNull
          ].indexOf(x.value) < 0
        );
      } else {
        return true;
      }
    });

    this.resetDateUsingFraction();
    this.resetDateToUsingFraction();

    this.buildTsRelativeValueForm();
    this.buildTsForValueForm();
    this.buildTsLastValueForm();
    this.buildTsNextValueForm();

    let structState = this.structQuery.getValue();
    let firstDayOfWeek =
      structState.weekStart === common.ProjectWeekStartEnum.Monday ? 1 : 0;

    this.onYearDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onYearDateI18n.formatDate = (d: DatePickerDate) => `${d.year}`;

    this.onMonthDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onMonthDateI18n.formatDate = (d: DatePickerDate) => {
      let monthIndex = d.month + 1;
      let month =
        monthIndex.toString().length === 1 ? `0${monthIndex}` : `${monthIndex}`;

      return `${d.year}-${month}`;
    };

    this.onDayDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onHourDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.onMinuteDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.beforeDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.afterDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.inRangeFromDateI18n.firstDayOfWeek = firstDayOfWeek;
    this.inRangeToDateI18n.firstDayOfWeek = firstDayOfWeek;
  }

  buildTsRelativeValueForm() {
    this.tsRelativeValueForm = this.fb.group({
      tsRelativeValue: [
        this.fraction.tsRelativeValue,
        [
          Validators.required,
          ValidationService.integerOrEmptyValidator,
          Validators.min(0)
        ]
      ]
    });
  }

  buildTsForValueForm() {
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

  buildTsLastValueForm() {
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

  buildTsNextValueForm() {
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

  resetDateUsingFraction() {
    let now = new Date();

    let year = common.isDefined(this.fraction.tsDateYear)
      ? this.fraction.tsDateYear
      : now.getFullYear();

    let month = common.isDefined(this.fraction.tsDateMonth)
      ? this.fraction.tsDateMonth
      : now.getMonth() + 1;

    let day = common.isDefined(this.fraction.tsDateDay)
      ? this.fraction.tsDateDay
      : now.getDate();

    let hour = common.isDefined(this.fraction.tsDateHour)
      ? this.fraction.tsDateHour
      : 0;

    let minute = common.isDefined(this.fraction.tsDateMinute)
      ? this.fraction.tsDateMinute
      : 0;

    let second = 0;

    let pad = (value: any) => String(value).padStart(2, '0');

    this.dateStr = `${year}-${pad(month)}-${pad(day)}`;
    this.timeStr = `${pad(hour)}:${pad(minute)}:${pad(second)}`;
  }

  resetDateToUsingFraction() {
    let date = new Date();

    date.setDate(date.getDate() + 1);

    let year = common.isDefined(this.fraction.tsDateToYear)
      ? this.fraction.tsDateToYear
      : date.getFullYear();

    let month = common.isDefined(this.fraction.tsDateToMonth)
      ? this.fraction.tsDateToMonth
      : date.getMonth() + 1;

    let day = common.isDefined(this.fraction.tsDateToDay)
      ? this.fraction.tsDateToDay
      : date.getDate();

    let hour = common.isDefined(this.fraction.tsDateToHour)
      ? this.fraction.tsDateToHour
      : 0;

    let minute = common.isDefined(this.fraction.tsDateToMinute)
      ? this.fraction.tsDateToMinute
      : 0;

    let second = 0;

    let pad = (value: any) => String(value).padStart(2, '0');

    this.dateToStr = `${year}-${pad(month)}-${pad(day)}`;
    this.timeToStr = `${pad(hour)}:${pad(minute)}:${pad(second)}`;
  }

  updateRelativeControls() {
    this.updateControlTsRelativeValueFromFraction();
  }

  updateControlTsRelativeValueFromFraction() {
    this.tsRelativeValueForm.controls['tsRelativeValue'].setValue(
      this.fraction.tsRelativeValue
    );
  }

  updateForControls() {
    this.updateControlForValueFromFraction();
  }

  updateControlForValueFromFraction() {
    this.tsForValueForm.controls['tsForValue'].setValue(
      this.fraction.tsForValue
    );
  }

  typeChange(fractionTypeItem: FractionTypeItem) {
    let fractionType = fractionTypeItem.value;

    switch (fractionType) {
      case this.fractionTypeEnum.TsIsAnyValue: {
        let mBrick = MALLOY_FILTER_ANY;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick) ? mBrick : `any`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnYear: {
        let yearStr = this.timeService.getYearStr({
          dateValue: this.dateStr
        });

        let mBrick = `f\`${yearStr}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `on ${yearStr}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          tsDateYear: Number(this.dateStr.split('-')[0])
        };

        this.emitFractionUpdate();
        break;
      }

      // case this.fractionTypeEnum.TsIsOnQuarter: {} // TODO: TsIsOnQuarter

      case this.fractionTypeEnum.TsIsOnMonth: {
        let monthStr = this.timeService.getMonthStr({
          dateValue: this.dateStr,
          dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
        });

        let mBrick = `f\`${monthStr}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `on ${monthStr}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          tsDateYear: Number(this.dateStr.split('-')[0]),
          tsDateMonth: Number(this.dateStr.split('-')[1].replace(/^0+/, ''))
        };

        this.emitFractionUpdate();
        break;
      }

      // case this.fractionTypeEnum.TsIsOnWeek: {} // TODO: TsIsOnWeek

      case this.fractionTypeEnum.TsIsOnDay: {
        let dayStr = this.timeService.getDayStr({
          dateValue: this.dateStr,
          dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
        });

        let mBrick = `f\`${dayStr}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `on ${dayStr}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          tsDateYear: Number(this.dateStr.split('-')[0]),
          tsDateMonth: Number(this.dateStr.split('-')[1].replace(/^0+/, '')),
          tsDateDay: Number(this.dateStr.split('-')[2].replace(/^0+/, ''))
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnHour: {
        let hourStr = this.timeService.getHourStr({
          dateValue: this.dateStr,
          timeValue: this.timeStr,
          dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
        });

        let mBrick = `f\`${hourStr}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `on ${hourStr}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          tsDateYear: Number(this.dateStr.split('-')[0]),
          tsDateMonth: Number(this.dateStr.split('-')[1].replace(/^0+/, '')),
          tsDateDay: Number(this.dateStr.split('-')[2].replace(/^0+/, '')),
          tsDateHour: Number(this.timeStr.split(':')[0].replace(/^0+/, ''))
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnMinute: {
        let minuteStr = this.timeService.getMinuteStr({
          dateValue: this.dateStr,
          timeValue: this.timeStr,
          dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
        });

        let mBrick = `f\`${minuteStr}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `on ${minuteStr}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: common.FractionTypeEnum.TsIsOnMinute,
          tsDateYear: Number(this.dateStr.split('-')[0]),
          tsDateMonth: Number(this.dateStr.split('-')[1].replace(/^0+/, '')),
          tsDateDay: Number(this.dateStr.split('-')[2].replace(/^0+/, '')),
          tsDateHour: Number(this.timeStr.split(':')[0].replace(/^0+/, '')),
          tsDateMinute: Number(this.timeStr.split(':')[1].replace(/^0+/, ''))
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsInRange: {
        this.buildFractionRange({
          dateValue: this.dateStr,
          timeValue: this.timeStr,
          dateToValue: this.dateToStr,
          timeToValue: this.timeToStr
        });

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsBeforeDate: {
        this.fraction.tsForOption = common.FractionTsForOptionEnum.ForInfinity;
        this.fraction.tsForValue = 1;
        this.fraction.tsForUnit = common.FractionTsForUnitEnum.Weeks;

        this.buildFractionBeforeDate({
          dateValue: this.dateStr,
          timeValue: this.timeStr
        });
        this.updateForControls();

        if (
          this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
          this.tsForValueForm.valid
        ) {
          this.emitFractionUpdate();
        }
        break;
      }

      case this.fractionTypeEnum.TsIsThrough: {
        // this.fraction.tsForOption = common.FractionTsForOptionEnum.ForInfinity;
        // this.fraction.tsForValue = 1;
        // this.fraction.tsForUnit = common.FractionTsForUnitEnum.Weeks;

        this.buildFractionThrough({
          dateValue: this.dateStr,
          timeValue: this.timeStr
        });
        this.updateForControls();

        // if (
        // this.fraction.tsForOption ===
        //   common.FractionTsForOptionEnum.ForInfinity ||
        // this.tsForValueForm.valid
        // ) {
        this.emitFractionUpdate();
        // }
        break;
      }

      case this.fractionTypeEnum.TsIsAfterDate: {
        this.fraction.tsForOption = common.FractionTsForOptionEnum.ForInfinity;
        this.fraction.tsForValue = 1;
        this.fraction.tsForUnit = common.FractionTsForUnitEnum.Weeks;

        this.buildFractionAfterDate({
          dateValue: this.dateStr,
          timeValue: this.timeStr
        });
        this.updateForControls();

        if (
          this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
          this.tsForValueForm.valid
        ) {
          this.emitFractionUpdate();
        }
        break;
      }

      case this.fractionTypeEnum.TsIsStarting: {
        // this.fraction.tsForOption = common.FractionTsForOptionEnum.ForInfinity;
        // this.fraction.tsForValue = 1;
        // this.fraction.tsForUnit = common.FractionTsForUnitEnum.Weeks;

        this.buildFractionStarting({
          dateValue: this.dateStr,
          timeValue: this.timeStr
        });
        this.updateForControls();

        // if (
        // this.fraction.tsForOption ===
        //   common.FractionTsForOptionEnum.ForInfinity ||
        // this.tsForValueForm.valid
        // ) {
        this.emitFractionUpdate();
        // }
        break;
      }

      case this.fractionTypeEnum.TsIsBeginFor: {
        this.fraction.tsForOption = common.FractionTsForOptionEnum.ForInfinity;
        this.fraction.tsForValue = 1;
        this.fraction.tsForUnit = common.FractionTsForUnitEnum.Weeks;

        this.buildFractionBeginFor({
          dateValue: this.dateStr,
          timeValue: this.timeStr
        });
        this.updateForControls();

        if (
          this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
          this.tsForValueForm.valid
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
        this.fraction.tsLastValue = 5;
        this.fraction.tsLastUnit = common.FractionTsLastUnitEnum.Days;
        this.fraction.tsLastCompleteOption =
          common.FractionTsLastCompleteOptionEnum.CompletePlusCurrent;

        this.buildFractionLast();

        this.tsLastValueForm.controls['tsLastValue'].setValue(
          this.fraction.tsLastValue
        );

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsInNext: {
        this.fraction.tsNextValue = 5;
        this.fraction.tsNextUnit = common.FractionTsNextUnitEnum.Days;

        this.buildFractionNext();

        this.tsNextValueForm.controls['tsNextValue'].setValue(
          this.fraction.tsNextValue
        );

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsNull: {
        let mBrick = 'f`null`';

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick) ? mBrick : `null`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsNotNull: {
        let mBrick = 'f`not null`';

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `not null`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
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

  buildFractionRange(item: {
    dateValue: string;
    timeValue: string;
    dateToValue: string;
    timeToValue: string;
  }) {
    let { dateValue, timeValue, dateToValue, timeToValue } = item;

    let minuteStr = this.timeService.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue,
      dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
    });

    let dateMinuteStr =
      Number(timeValue.split(':')[0].replace(/^0+/, '')) > 0 ||
      Number(timeValue.split(':')[1].replace(/^0+/, '')) > 0
        ? minuteStr
        : minuteStr.split(' ')[0];

    let minuteToStr = this.timeService.getMinuteStr({
      dateValue: dateToValue,
      timeValue: timeToValue,
      dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
    });

    let dateMinuteToStr =
      Number(timeToValue.split(':')[0].replace(/^0+/, '')) > 0 ||
      Number(timeToValue.split(':')[1].replace(/^0+/, '')) > 0
        ? minuteToStr
        : minuteToStr.split(' ')[0];

    let mBrick = `f\`${dateMinuteStr} to ${dateMinuteToStr}\``;

    this.fraction = {
      brick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : `on ${minuteStr} to ${minuteToStr}`,
      parentBrick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsInRange,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsDateToYear: Number(dateToValue.split('-')[0]),
      tsDateToMonth: Number(dateToValue.split('-')[1].replace(/^0+/, '')),
      tsDateToDay: Number(dateToValue.split('-')[2].replace(/^0+/, '')),
      tsDateToHour: Number(timeToValue.split(':')[0].replace(/^0+/, '')),
      tsDateToMinute: Number(timeToValue.split(':')[1].replace(/^0+/, ''))
    };
  }

  buildFractionBeforeDate(item: { dateValue: string; timeValue: string }) {
    let { dateValue, timeValue } = item;

    let minuteStr = this.timeService.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue,
      dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
    });

    let newTsForOption = common.isDefined(this.fraction.tsForOption)
      ? this.fraction.tsForOption
      : common.FractionTsForOptionEnum.ForInfinity;

    let dateMinuteStr =
      Number(timeValue.split(':')[0].replace(/^0+/, '')) > 0 ||
      Number(timeValue.split(':')[1].replace(/^0+/, '')) > 0
        ? minuteStr
        : minuteStr.split(' ')[0];

    let mBrick = `f\`before ${dateMinuteStr}\``;

    this.fraction = {
      brick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : newTsForOption === common.FractionTsForOptionEnum.ForInfinity
          ? `before ${minuteStr}`
          : `before ${minuteStr} for ${this.fraction.tsForValue} ${this.fraction.tsForUnit}`,
      parentBrick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsBeforeDate,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsForOption: newTsForOption,
      tsForValue: this.fraction.tsForValue,
      tsForUnit: this.fraction.tsForUnit
    };
  }

  buildFractionThrough(item: { dateValue: string; timeValue: string }) {
    let { dateValue, timeValue } = item;

    let minuteStr = this.timeService.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue,
      dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
    });

    // let newTsForOption = common.isDefined(this.fraction.tsForOption)
    //   ? this.fraction.tsForOption
    //   : common.FractionTsForOptionEnum.ForInfinity;

    let dateMinuteStr =
      Number(timeValue.split(':')[0].replace(/^0+/, '')) > 0 ||
      Number(timeValue.split(':')[1].replace(/^0+/, '')) > 0
        ? minuteStr
        : minuteStr.split(' ')[0];

    let mBrick = `f\`through ${dateMinuteStr}\``;

    this.fraction = {
      brick: common.isDefined(this.fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsThrough,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, ''))
      // tsForOption: newTsForOption,
      // tsForValue: this.fraction.tsForValue,
      // tsForUnit: this.fraction.tsForUnit
    };
  }

  buildFractionAfterDate(item: { dateValue: string; timeValue: string }) {
    let { dateValue, timeValue } = item;

    let minuteStr = this.timeService.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue,
      dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
    });

    let newTsForOption = common.isDefined(this.fraction.tsForOption)
      ? this.fraction.tsForOption
      : common.FractionTsForOptionEnum.ForInfinity;

    let dateMinuteStr =
      Number(timeValue.split(':')[0].replace(/^0+/, '')) > 0 ||
      Number(timeValue.split(':')[1].replace(/^0+/, '')) > 0
        ? minuteStr
        : minuteStr.split(' ')[0];

    let mBrick = `f\`after ${dateMinuteStr}\``;

    this.fraction = {
      brick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : newTsForOption === common.FractionTsForOptionEnum.ForInfinity
          ? `after ${minuteStr}`
          : `after ${minuteStr} for ${this.fraction.tsForValue} ${this.fraction.tsForUnit}`,
      parentBrick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsAfterDate,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsForOption: newTsForOption,
      tsForValue: this.fraction.tsForValue,
      tsForUnit: this.fraction.tsForUnit
    };
  }

  buildFractionStarting(item: { dateValue: string; timeValue: string }) {
    let { dateValue, timeValue } = item;

    let minuteStr = this.timeService.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue,
      dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
    });

    // let newTsForOption = common.isDefined(this.fraction.tsForOption)
    //   ? this.fraction.tsForOption
    //   : common.FractionTsForOptionEnum.ForInfinity;

    let dateMinuteStr =
      Number(timeValue.split(':')[0].replace(/^0+/, '')) > 0 ||
      Number(timeValue.split(':')[1].replace(/^0+/, '')) > 0
        ? minuteStr
        : minuteStr.split(' ')[0];

    let mBrick = `f\`starting ${dateMinuteStr}\``;

    this.fraction = {
      brick: common.isDefined(this.fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsStarting,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, ''))
      // tsForOption: newTsForOption,
      // tsForValue: this.fraction.tsForValue,
      // tsForUnit: this.fraction.tsForUnit
    };
  }

  buildFractionBeginFor(item: { dateValue: string; timeValue: string }) {
    let { dateValue, timeValue } = item;

    let minuteStr = this.timeService.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue,
      dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
    });

    let dateMinuteStr =
      Number(timeValue.split(':')[0].replace(/^0+/, '')) > 0 ||
      Number(timeValue.split(':')[1].replace(/^0+/, '')) > 0
        ? minuteStr
        : minuteStr.split(' ')[0];

    let mBrick = `f\`${dateMinuteStr} for ${this.fraction.tsForValue} ${this.fraction.tsForUnit}\``;

    this.fraction = {
      brick: common.isDefined(this.fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsBeginFor,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      // tsForOption: common.FractionTsForOptionEnum.For,
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

    this.fraction = {
      brick:
        this.fraction.tsForOption === common.FractionTsForOptionEnum.ForInfinity
          ? `before ${newPart2}`
          : `before ${newPart2} for ${this.fraction.tsForValue} ${this.fraction.tsForUnit}`,
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

    this.fraction = {
      brick:
        this.fraction.tsForOption === common.FractionTsForOptionEnum.ForInfinity
          ? `after ${newPart2}`
          : `after ${newPart2} for ${this.fraction.tsForValue} ${this.fraction.tsForUnit}`,
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

  yearDateValueChanged(x: any) {
    let datePickerOnYear = this.datePickerOnYear?.nativeElement;
    if (common.isDefined(datePickerOnYear)) {
      let value = datePickerOnYear.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        let onYearStr = this.timeService.getYearStr({
          dateValue: value
        });

        // this.fraction = {
        //   brick: `on ${onYearStr}`,
        //   operator: this.fraction.operator,
        //   type: this.fraction.type,
        //   tsDateYear: Number(value.split('-')[0])
        // };

        let mBrick = `f\`${onYearStr}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `on ${onYearStr}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: this.fraction.operator,
          type: this.fraction.type,
          tsDateYear: Number(value.split('-')[0])
        };

        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerOnYear.blur();
        }, 1);
      }
    }
  }

  monthDateValueChanged(x: any) {
    let datePickerOnMonth = this.datePickerOnMonth?.nativeElement;
    if (common.isDefined(datePickerOnMonth)) {
      let value = datePickerOnMonth.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        let onMonthStr = this.timeService.getMonthStr({
          dateValue: value,
          dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
        });

        // this.fraction = {
        //   brick: `on ${onMonthStr}`,
        //   operator: this.fraction.operator,
        //   type: this.fraction.type,
        //   tsDateYear: Number(value.split('-')[0]),
        //   tsDateMonth: Number(value.split('-')[1].replace(/^0+/, ''))
        // };

        let mBrick = `f\`${onMonthStr}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `on ${onMonthStr}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: this.fraction.operator,
          type: this.fraction.type,
          tsDateYear: Number(value.split('-')[0]),
          tsDateMonth: Number(value.split('-')[1].replace(/^0+/, ''))
        };

        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerOnMonth.blur();
        }, 1);
      }
    }
  }

  dayDateValueChanged(x: any) {
    let datePickerOnDay = this.datePickerOnDay?.nativeElement;
    if (common.isDefined(datePickerOnDay)) {
      let value = datePickerOnDay.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        let onDayStr = this.timeService.getDayStr({
          dateValue: value,
          dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
        });

        // this.fraction = {
        //   brick: `on ${onDayStr}`,
        //   operator: this.fraction.operator,
        //   type: this.fraction.type,
        //   tsDateYear: Number(value.split('-')[0]),
        //   tsDateMonth: Number(value.split('-')[1].replace(/^0+/, '')),
        //   tsDateDay: Number(value.split('-')[2].replace(/^0+/, ''))
        // };

        let mBrick = `f\`${onDayStr}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `on ${onDayStr}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: this.fraction.operator,
          type: this.fraction.type,
          tsDateYear: Number(value.split('-')[0]),
          tsDateMonth: Number(value.split('-')[1].replace(/^0+/, '')),
          tsDateDay: Number(value.split('-')[2].replace(/^0+/, ''))
        };

        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerOnDay.blur();
        }, 1);
      }
    }
  }

  hourDateValueChanged(x: any) {
    let datePickerOnHour = this.datePickerOnHour?.nativeElement;
    if (common.isDefined(datePickerOnHour)) {
      let value = datePickerOnHour.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        let onHourStr = this.timeService.getHourStr({
          dateValue: value,
          timeValue: this.timeStr,
          dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
        });

        // this.fraction = {
        //   brick: `on ${onHourStr}`,
        //   operator: this.fraction.operator,
        //   type: this.fraction.type,
        //   tsDateYear: Number(value.split('-')[0]),
        //   tsDateMonth: Number(value.split('-')[1].replace(/^0+/, '')),
        //   tsDateDay: Number(value.split('-')[2].replace(/^0+/, '')),
        //   tsDateHour: Number(this.timeStr.split(':')[0].replace(/^0+/, ''))
        // };

        let mBrick = `f\`${onHourStr}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `on ${onHourStr}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: this.fraction.operator,
          type: this.fraction.type,
          tsDateYear: Number(value.split('-')[0]),
          tsDateMonth: Number(value.split('-')[1].replace(/^0+/, '')),
          tsDateDay: Number(value.split('-')[2].replace(/^0+/, '')),
          tsDateHour: Number(this.timeStr.split(':')[0].replace(/^0+/, ''))
        };

        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerOnHour.blur();
        }, 1);
      }
    }
  }

  hourTimeValueChanged(x: any) {
    let timePickerOnHour = this.timePickerOnHour?.nativeElement;
    if (common.isDefined(timePickerOnHour)) {
      let value = timePickerOnHour.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeStr = value;

        let onHourStr = this.timeService.getHourStr({
          dateValue: this.dateStr,
          timeValue: value,
          dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
        });

        // this.fraction = {
        //   brick: `on ${onHourStr}`,
        //   operator: this.fraction.operator,
        //   type: this.fraction.type,
        //   tsDateYear: Number(this.dateStr.split('-')[0]),
        //   tsDateMonth: Number(this.dateStr.split('-')[1].replace(/^0+/, '')),
        //   tsDateDay: Number(this.dateStr.split('-')[2].replace(/^0+/, '')),
        //   tsDateHour: Number(value.split(':')[0].replace(/^0+/, ''))
        // };

        let mBrick = `f\`${onHourStr}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `on ${onHourStr}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: this.fraction.operator,
          type: this.fraction.type,
          tsDateYear: Number(this.dateStr.split('-')[0]),
          tsDateMonth: Number(this.dateStr.split('-')[1].replace(/^0+/, '')),
          tsDateDay: Number(this.dateStr.split('-')[2].replace(/^0+/, '')),
          tsDateHour: Number(value.split(':')[0].replace(/^0+/, ''))
        };

        this.emitFractionUpdate();

        setTimeout(() => {
          timePickerOnHour.blur();
        }, 1);
      }
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
    if (common.isDefined(datePickerOnMinute)) {
      let value = datePickerOnMinute.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        let onMinuteStr = this.timeService.getMinuteStr({
          dateValue: value,
          timeValue: this.timeStr,
          dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
        });

        // this.fraction = {
        //   brick: `on ${onMinuteStr}`,
        //   operator: this.fraction.operator,
        //   type: this.fraction.type,
        //   tsDateYear: Number(value.split('-')[0]),
        //   tsDateMonth: Number(value.split('-')[1].replace(/^0+/, '')),
        //   tsDateDay: Number(value.split('-')[2].replace(/^0+/, '')),
        //   tsDateHour: Number(this.timeStr.split(':')[0].replace(/^0+/, ''))
        // };

        let mBrick = `f\`${onMinuteStr}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `on ${onMinuteStr}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: this.fraction.operator,
          type: this.fraction.type,
          tsDateYear: Number(value.split('-')[0]),
          tsDateMonth: Number(value.split('-')[1].replace(/^0+/, '')),
          tsDateDay: Number(value.split('-')[2].replace(/^0+/, '')),
          tsDateHour: Number(this.timeStr.split(':')[0].replace(/^0+/, ''))
        };

        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerOnMinute.blur();
        }, 1);
      }
    }
  }

  minuteTimeValueChanged(x: any) {
    let timePickerOnMinute = this.timePickerOnMinute?.nativeElement;
    if (common.isDefined(timePickerOnMinute)) {
      let value = timePickerOnMinute.value;

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeStr = value;

        let onMinuteStr = this.timeService.getMinuteStr({
          dateValue: this.dateStr,
          timeValue: value,
          dateSeparator: common.isDefined(this.fraction.parentBrick) ? '-' : '/'
        });

        // this.fraction = {
        //   brick: `on ${onMinuteStr}`,
        //   operator: this.fraction.operator,
        //   type: this.fraction.type,
        //   tsDateYear: Number(this.dateStr.split('-')[0]),
        //   tsDateMonth: Number(this.dateStr.split('-')[1].replace(/^0+/, '')),
        //   tsDateDay: Number(this.dateStr.split('-')[2].replace(/^0+/, '')),
        //   tsDateHour: Number(value.split(':')[0].replace(/^0+/, '')),
        //   tsDateMinute: Number(value.split(':')[1].replace(/^0+/, ''))
        // };

        let mBrick = `f\`${onMinuteStr}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `on ${onMinuteStr}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: this.fraction.operator,
          type: this.fraction.type,
          tsDateYear: Number(this.dateStr.split('-')[0]),
          tsDateMonth: Number(this.dateStr.split('-')[1].replace(/^0+/, '')),
          tsDateDay: Number(this.dateStr.split('-')[2].replace(/^0+/, '')),
          tsDateHour: Number(value.split(':')[0].replace(/^0+/, '')),
          tsDateMinute: Number(value.split(':')[1].replace(/^0+/, ''))
        };

        this.emitFractionUpdate();

        setTimeout(() => {
          timePickerOnMinute.blur();
        }, 1);
      }
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

        this.buildFractionRange({
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

        this.buildFractionRange({
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

        this.buildFractionRange({
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

        this.buildFractionRange({
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

        this.buildFractionBeforeDate({
          dateValue: value,
          timeValue: this.timeStr
        });

        if (
          this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
          this.tsForValueForm.valid
        ) {
          this.emitFractionUpdate();
        }

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

        this.buildFractionBeforeDate({
          dateValue: this.dateStr,
          timeValue: value
        });

        if (
          this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
          this.tsForValueForm.valid
        ) {
          this.emitFractionUpdate();
        }

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

        this.buildFractionThrough({
          dateValue: value,
          timeValue: this.timeStr
        });

        // if (
        //   this.fraction.tsForOption ===
        //     common.FractionTsForOptionEnum.ForInfinity ||
        //   this.tsForValueForm.valid
        // ) {
        this.emitFractionUpdate();
        // }

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

        this.buildFractionThrough({
          dateValue: this.dateStr,
          timeValue: value
        });

        // if (
        //   this.fraction.tsForOption ===
        //     common.FractionTsForOptionEnum.ForInfinity ||
        //   this.tsForValueForm.valid
        // ) {
        this.emitFractionUpdate();
        // }

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

        this.buildFractionAfterDate({
          dateValue: value,
          timeValue: this.timeStr
        });

        if (
          this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
          this.tsForValueForm.valid
        ) {
          this.emitFractionUpdate();
        }

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

        this.buildFractionAfterDate({
          dateValue: this.dateStr,
          timeValue: value
        });

        if (
          this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
          this.tsForValueForm.valid
        ) {
          this.emitFractionUpdate();
        }

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

        this.buildFractionStarting({
          dateValue: value,
          timeValue: this.timeStr
        });

        // if (
        //   this.fraction.tsForOption ===
        //     common.FractionTsForOptionEnum.ForInfinity ||
        //   this.tsForValueForm.valid
        // ) {
        this.emitFractionUpdate();
        // }

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

        this.buildFractionStarting({
          dateValue: this.dateStr,
          timeValue: value
        });

        // if (
        //   this.fraction.tsForOption ===
        //     common.FractionTsForOptionEnum.ForInfinity ||
        //   this.tsForValueForm.valid
        // ) {
        this.emitFractionUpdate();
        // }

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

        this.buildFractionBeginFor({
          dateValue: value,
          timeValue: this.timeStr
        });

        if (
          // this.fraction.tsForOption ===
          //   common.FractionTsForOptionEnum.ForInfinity ||
          this.tsForValueForm.valid
        ) {
          this.emitFractionUpdate();
        }

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

        this.buildFractionBeginFor({
          dateValue: this.dateStr,
          timeValue: value
        });

        if (
          //   this.fraction.tsForOption ===
          //     common.FractionTsForOptionEnum.ForInfinity ||
          this.tsForValueForm.valid
        ) {
          this.emitFractionUpdate();
        }

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

  relativeValueBlur() {
    let value = this.tsRelativeValueForm.controls['tsRelativeValue'].value;

    if (value !== this.fraction.tsRelativeValue) {
      this.fraction.tsRelativeValue = Number(value);
      this.buildRelative();
    }
  }

  relativeTsUnitOptionChange() {
    this.buildRelative();
  }

  relativeTsCompleteOptionChange() {
    this.buildRelative();
  }

  relativeTsWhenOptionChange() {
    this.buildRelative();
  }

  tsForOptionChange() {
    let value = this.fraction.tsForOption;

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

    this.buildEmitFor();
  }

  forValueBlur() {
    let value = this.tsForValueForm.controls['tsForValue'].value;

    if (value !== this.fraction.tsForValue) {
      this.fraction.tsForValue = Number(value);
      this.buildEmitFor();
    }
  }

  tsForUnitChange() {
    this.buildEmitFor();
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
      this.tsRelativeValueForm.valid &&
      (this.fraction.tsForOption ===
        common.FractionTsForOptionEnum.ForInfinity ||
        this.tsForValueForm.valid)
    ) {
      this.emitFractionUpdate();
    }
  }

  buildEmitFor() {
    this.buildFractionBeginFor({
      dateValue: this.dateStr,
      timeValue: this.timeStr
    });

    // if (this.fraction.type === common.FractionTypeEnum.TsIsBeforeDate) {
    //   this.buildFractionBeforeDate({
    //     dateValue: this.dateStr,
    //     timeValue: this.timeStr
    //   });
    // }

    // if (this.fraction.type === common.FractionTypeEnum.TsIsAfterDate) {
    //   this.buildFractionAfterDate({
    //     dateValue: this.dateStr,
    //     timeValue: this.timeStr
    //   });
    // }

    // if (this.fraction.type === common.FractionTypeEnum.TsIsBeforeRelative) {
    //   this.buildFractionBeforeRelative();
    // }
    // if (this.fraction.type === common.FractionTypeEnum.TsIsAfterRelative) {
    //   this.buildFractionAfterRelative();
    // }

    this.updateForControls();

    if (
      // ([
      //   common.FractionTypeEnum.TsIsBeforeRelative,
      //   common.FractionTypeEnum.TsIsAfterRelative
      // ].indexOf(this.fraction.type) < 0 ||
      //   this.tsRelativeValueForm.valid) &&
      // (
      // this.fraction.tsForOption ===
      // common.FractionTsForOptionEnum.ForInfinity ||
      this.tsForValueForm.valid
      // )
    ) {
      this.emitFractionUpdate();
    }
  }

  buildFractionLast() {
    let mBrick =
      this.fraction.tsLastCompleteOption ===
      common.FractionTsLastCompleteOptionEnum.Incomplete
        ? `f\`${this.fraction.tsLastValue} ${this.fraction.tsLastUnit}\``
        : this.fraction.tsLastCompleteOption ===
            common.FractionTsLastCompleteOptionEnum.Complete
          ? `f\`last ${this.fraction.tsLastValue} ${this.fraction.tsLastUnit}\``
          : `f\`${this.fraction.tsLastValue} ${this.fraction.tsLastUnit} ago to now\``;

    this.fraction = {
      brick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : this.fraction.tsLastCompleteOption ===
            common.FractionTsLastCompleteOptionEnum.Incomplete
          ? `last ${this.fraction.tsLastValue} ${this.fraction.tsLastUnit}`
          : this.fraction.tsLastCompleteOption ===
              common.FractionTsLastCompleteOptionEnum.Complete
            ? `last ${this.fraction.tsLastValue} ${this.fraction.tsLastUnit} complete`
            : `last ${this.fraction.tsLastValue} ${this.fraction.tsLastUnit} complete plus current`,
      parentBrick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsInLast,
      tsLastValue: this.fraction.tsLastValue,
      tsLastUnit: this.fraction.tsLastUnit,
      tsLastCompleteOption: this.fraction.tsLastCompleteOption
    };
  }

  tsLastValueBlur() {
    let value = this.tsLastValueForm.controls['tsLastValue'].value;

    if (value !== this.fraction.tsLastValue) {
      this.fraction.tsLastValue = Number(value);

      this.buildFractionLast();

      if (this.tsLastValueForm.valid) {
        this.emitFractionUpdate();
      }
    }
  }

  tsLastUnitChange() {
    this.buildFractionLast();

    if (this.tsLastValueForm.valid) {
      this.emitFractionUpdate();
    }
  }

  tsLastCompleteOptionChange() {
    this.buildFractionLast();

    if (this.tsLastValueForm.valid) {
      this.emitFractionUpdate();
    }
  }

  buildFractionNext() {
    let mBrick = `f\`next ${this.fraction.tsNextValue} ${this.fraction.tsNextUnit}\``;

    this.fraction = {
      brick: common.isDefined(this.fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsInNext,
      tsNextValue: this.fraction.tsNextValue,
      tsNextUnit: this.fraction.tsNextUnit
    };
  }

  tsNextValueBlur() {
    let value = this.tsNextValueForm.controls['tsNextValue'].value;

    if (value !== this.fraction.tsNextValue) {
      this.fraction.tsNextValue = Number(value);

      this.buildFractionNext();

      if (this.tsNextValueForm.valid) {
        this.emitFractionUpdate();
      }
    }
  }

  tsNextUnitChange() {
    this.buildFractionNext();

    if (this.tsNextValueForm.valid) {
      this.emitFractionUpdate();
    }
  }

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }

  toggleShowHours() {
    this.uiQuery.updatePart({ showHours: !this.showHours });
  }
}
