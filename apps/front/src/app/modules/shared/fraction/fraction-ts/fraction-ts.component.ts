import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import '@vaadin/date-picker';
import {
  DatePicker,
  DatePickerDate,
  DatePickerI18n
} from '@vaadin/date-picker';
import '@vaadin/time-picker';
import { TimePicker } from '@vaadin/time-picker';
import { en_US, NzI18nService } from 'ng-zorro-antd/i18n';
import { StructQuery } from '~front/app/queries/struct.query';
import { ValidationService } from '~front/app/services/validation.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import {
  FractionTsForOptionItem,
  FractionTsForUnitItem,
  FractionTsLastCompleteOptionItem,
  FractionTsLastUnitItem,
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
// ,
// OnChanges, AfterViewInit
export class FractionTsComponent implements OnInit {
  fractionTypeEnum = common.FractionTypeEnum;
  fractionTsForOptionEnum = common.FractionTsForOptionEnum;

  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

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

  @ViewChild('datePickerAfter') datePickerAfter: ElementRef<DatePicker>;
  @ViewChild('timePickerAfter') timePickerAfter: ElementRef<TimePicker>;

  @ViewChild('datePickerInRangeFrom')
  datePickerInRangeFrom: ElementRef<DatePicker>;
  @ViewChild('timePickerInRangeFrom')
  timePickerInRangeFrom: ElementRef<TimePicker>;

  @ViewChild('datePickerInRangeTo') datePickerInRangeTo: ElementRef<DatePicker>;
  @ViewChild('timePickerInRangeTo') timePickerInRangeTo: ElementRef<TimePicker>;

  // @ViewChild('timePickerOnHour') timePickerOnHour: NzTimePickerComponent;
  // @ViewChild('timePickerOnMinute') timePickerOnMinute: NzTimePickerComponent;
  // @ViewChild('timePickerInRangeFrom')
  // timePickerInRangeFrom: NzTimePickerComponent;
  // @ViewChild('timePickerInRangeTo') timePickerInRangeTo: NzTimePickerComponent;
  // @ViewChild('timePickerBeforeDate')
  // timePickerBeforeDate: NzTimePickerComponent;
  // @ViewChild('timePickerAfterDate') timePickerAfterDate: NzTimePickerComponent;

  // date: Date;
  // dateTo: Date;

  fractionTypeForm: FormGroup;

  tsRelativeValueForm: FormGroup;

  tsRelativeUnitForm: FormGroup;
  tsRelativeCompleteForm: FormGroup;
  tsRelativeWhenForm: FormGroup;

  tsForForm: FormGroup;
  tsForValueForm: FormGroup;
  tsForUnitForm: FormGroup;

  tsLastValueForm: FormGroup;
  tsLastUnitForm: FormGroup;
  tsLastCompleteOptionForm: FormGroup;

  // nzMinuteStep = 60;
  // nzSecondStep = 60;

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

  fractionTsRelativeCompleteOptionsList: FractionTsRelativeCompleteOptionItem[] =
    [
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

  fractionTsLastCompleteOptionsList: FractionTsLastCompleteOptionItem[] = [
    {
      label: 'complete',
      value: common.FractionTsLastCompleteOptionEnum.Complete
    },
    {
      label: 'complete plus current',
      value: common.FractionTsLastCompleteOptionEnum.CompletePlusCurrent
    },
    {
      label: 'incomplete',
      value: common.FractionTsLastCompleteOptionEnum.Incomplete
    }
  ];

  commonI18n: DatePickerI18n = {
    monthNames: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ],
    weekdays: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ],
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    // An integer indicating the first day of the week
    // (0 = Sunday, 1 = Monday, etc.).
    firstDayOfWeek: 0,
    week: 'Week',
    calendar: 'Calendar',
    today: 'Today',
    cancel: 'Cancel',
    // Used for adjusting the year value when parsing dates with short years.
    // The year values between 0 and 99 are evaluated and adjusted.
    // Example: for a referenceDate of 1970-10-30;
    //   dateToBeParsed: 40-10-30, result: 1940-10-30
    //   dateToBeParsed: 80-10-30, result: 1980-10-30
    //   dateToBeParsed: 10-10-30, result: 2010-10-30
    // Supported date format: ISO 8601 `"YYYY-MM-DD"` (default)
    // The default value is the current date.
    referenceDate: '',
    formatDate: (d: DatePickerDate) => {
      let monthIndex = d.month + 1;
      let month =
        monthIndex.toString().length === 1 ? `0${monthIndex}` : `${monthIndex}`;

      let day = d.day.toString().length === 1 ? `0${d.day}` : `${d.day}`;

      return `${d.year}-${month}-${day}`;
    },
    // A function to parse the given text to an `Object` in the format `{ day: ..., month: ..., year: ... }`.
    // Must properly parse (at least) text formatted by `formatDate`.
    // Setting the property to null will disable keyboard input feature.
    // Note: The argument month is 0-based. This means that January = 0 and December = 11.
    parseDate: null,
    // parseDate: text => {
    // //   // Parses a string in 'MM/DD/YY', 'MM/DD' or 'DD' -format to
    // //   // an `Object` in the format `{ day: ..., month: ..., year: ... }`.
    // },
    formatTitle: (monthName: any, fullYear: any) => monthName + '  ' + fullYear
  };

  onYearDateI18n = Object.assign({}, this.commonI18n);
  onMonthDateI18n = Object.assign({}, this.commonI18n);
  onDayDateI18n = Object.assign({}, this.commonI18n);
  onHourDateI18n = Object.assign({}, this.commonI18n);
  onMinuteDateI18n = Object.assign({}, this.commonI18n);
  beforeDateI18n = Object.assign({}, this.commonI18n);
  afterDateI18n = Object.assign({}, this.commonI18n);
  inRangeFromDateI18n = Object.assign({}, this.commonI18n);
  inRangeToDateI18n = Object.assign({}, this.commonI18n);

  dateStr: string;
  dateToStr: string;

  timeStr: string;
  timeToStr: string;

  constructor(
    private fb: FormBuilder,
    private i18n: NzI18nService,
    private structQuery: StructQuery,
    private cd: ChangeDetectorRef
  ) {}

  // ngAfterViewInit(): void {
  //   this.makeTimepickerReadonly();
  // }

  // makeTimepickerReadonly() {
  // [
  //   this.timePickerOnHour,
  //   this.timePickerOnMinute,
  //   this.timePickerInRangeFrom,
  //   this.timePickerInRangeTo,
  //   this.timePickerBeforeDate,
  //   this.timePickerAfterDate
  // ]
  //   .filter(x => common.isDefined(x))
  //   .forEach(x => {
  //     x.inputRef.nativeElement.setAttribute('readonly', 'true');
  //   });
  // }

  ngOnInit() {
    this.i18n.setLocale(en_US);

    this.resetDateUsingFraction();
    this.resetDateToUsingFraction();

    this.buildFractionTypeForm();

    this.buildTsRelativeValueForm();
    this.buildTsRelativeUnitForm();
    this.buildTsRelativeCompleteForm();
    this.buildTsRelativeWhenForm();

    this.buildTsForForm();
    this.buildTsForValueForm();
    this.buildTsForUnitForm();

    this.buildTsLastValueForm();
    this.buildTsLastUnitForm();
    this.buildTsLastCompleteOptionForm();

    // this.makeTimepickerReadonly();

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

  // ngOnChanges(changes: SimpleChanges): void {
  // this.resetDateUsingFraction();
  // this.resetDateToUsingFraction();
  // this.makeTimepickerReadonly();
  // }

  buildFractionTypeForm() {
    this.fractionTypeForm = this.fb.group({
      fractionType: [this.fraction.type]
    });
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

  buildTsForUnitForm() {
    this.tsForUnitForm = this.fb.group({
      tsForUnit: [this.fraction.tsForUnit]
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

  buildTsLastUnitForm() {
    this.tsLastUnitForm = this.fb.group({
      tsLastUnit: [this.fraction.tsLastUnit]
    });
  }

  buildTsLastCompleteOptionForm() {
    this.tsLastCompleteOptionForm = this.fb.group({
      tsLastCompleteOption: [this.fraction.tsLastCompleteOption]
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

    // this.date = new Date(
    //   year,
    //   monthIndex,
    //   day,
    //   hour,
    //   minute,
    //   second,
    //   millisecond
    // );

    // this.date.setFullYear(year);

    let month = this.fraction.tsDateMonth || 1;
    let dayD = day.toString().length === 1 ? `0${day}` : `${day}`;

    let monthD = month.toString().length === 1 ? `0${month}` : `${month}`;
    let hourD = hour.toString().length === 1 ? `0${hour}` : `${hour}`;
    let minuteD = minute.toString().length === 1 ? `0${minute}` : `${minute}`;
    let secondD = second.toString().length === 1 ? `0${second}` : `${second}`;

    this.dateStr = `${year}-${monthD}-${dayD}`;
    this.timeStr = `${hourD}:${minuteD}:${secondD}`;

    console.log('reset Date');
    console.log(this.dateStr);
    console.log(this.timeStr);
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

    // this.dateTo = new Date(
    //   year,
    //   monthIndex,
    //   day,
    //   hour,
    //   minute,
    //   second,
    //   millisecond
    // );

    // this.dateTo.setFullYear(year);

    let month = this.fraction.tsDateToMonth || 1;
    let dayD = day.toString().length === 1 ? `0${day}` : `${day}`;

    let monthD = month.toString().length === 1 ? `0${month}` : `${month}`;
    let hourD = hour.toString().length === 1 ? `0${hour}` : `${hour}`;
    let minuteD = minute.toString().length === 1 ? `0${minute}` : `${minute}`;
    let secondD = second.toString().length === 1 ? `0${second}` : `${second}`;

    this.dateToStr = `${year}-${monthD}-${dayD}`;
    this.timeToStr = `${hourD}:${minuteD}:${secondD}`;

    console.log('reset DateTo');
    console.log(this.dateToStr);
    console.log(this.timeToStr);
  }

  updateRelativeControls() {
    this.updateControlTsRelativeValueFromFraction();
    this.updateControlTsRelativeUnitFromFraction();
    this.updateControlTsRelativeCompleteOptionFromFraction();
    this.updateControlTsRelativeWhenOptionFromFraction();
  }

  updateControlTsRelativeValueFromFraction() {
    this.tsRelativeValueForm.controls['tsRelativeValue'].setValue(
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

  updateForControls() {
    this.updateControlForOptionFromFraction();
    this.updateControlForValueFromFraction();
    this.updateControlForUnitFromFraction();
  }

  updateControlForOptionFromFraction() {
    this.tsForForm.controls['tsForOption'].setValue(this.fraction.tsForOption);
  }

  updateControlForValueFromFraction() {
    this.tsForValueForm.controls['tsForValue'].setValue(
      this.fraction.tsForValue
    );
  }

  updateControlForUnitFromFraction() {
    this.tsForUnitForm.controls['tsForUnit'].setValue(this.fraction.tsForUnit);
  }

  updateLastControls() {
    this.updateControlLastValueFromFraction();
    this.updateControlLastUnitFromFraction();
    this.updateControlLastCompleteOptionFromFraction();
  }

  updateControlLastValueFromFraction() {
    this.tsLastValueForm.controls['tsLastValue'].setValue(
      this.fraction.tsLastValue
    );
  }

  updateControlLastUnitFromFraction() {
    this.tsLastUnitForm.controls['tsLastUnit'].setValue(
      this.fraction.tsLastUnit
    );
  }
  updateControlLastCompleteOptionFromFraction() {
    this.tsLastCompleteOptionForm.controls['tsLastCompleteOption'].setValue(
      this.fraction.tsLastCompleteOption
    );
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
        // this.date = new Date();

        this.fraction = {
          brick: `on ${this.getYearStr({ dateValue: this.dateStr })}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          tsDateYear: Number(this.dateStr.split('-')[0])
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnMonth: {
        // this.date = new Date();

        this.fraction = {
          brick: `on ${this.getMonthStr({ dateValue: this.dateStr })}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          tsDateYear: Number(this.dateStr.split('-')[0]),
          tsDateMonth: Number(this.dateStr.split('-')[1].replace(/^0+/, ''))
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.TsIsOnDay: {
        // this.date = new Date();

        this.fraction = {
          brick: `on ${this.getDayStr({ dateValue: this.dateStr })}`,
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
        // this.date = new Date();
        // this.date.setMinutes(0);
        // this.date.setSeconds(0);

        this.fraction = {
          brick: `on ${this.getHourStr({
            dateValue: this.dateStr,
            timeValue: this.timeStr
          })}`,
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
        // this.date = new Date();
        // this.date.setSeconds(0);

        this.fraction = {
          brick: `on ${this.getMinuteStr({
            dateValue: this.dateStr,
            timeValue: this.timeStr
          })}`,
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
        // this.date = new Date();
        // this.dateTo = new Date();

        // this.date.setSeconds(0);
        // this.dateTo.setSeconds(0);

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
        // this.date = new Date();
        // this.date.setSeconds(0);

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

      case this.fractionTypeEnum.TsIsAfterDate: {
        // this.date = new Date();
        // this.date.setSeconds(0);

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
        this.fraction.tsLastValue = 1;
        this.fraction.tsLastUnit = common.FractionTsLastUnitEnum.Weeks;
        this.fraction.tsLastCompleteOption =
          common.FractionTsLastCompleteOptionEnum.Incomplete;

        this.buildFractionLast();

        this.updateLastControls();

        this.emitFractionUpdate();
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

  // getYearString(date: Date) {
  //   let year = this.getYearPart(date);

  //   return `${year}`;
  // }

  getYearStr(item: { dateValue: string }) {
    let year = item.dateValue.split('-')[0];

    return `${year}`;
  }

  // getMonthString(date: Date) {
  //   let year = this.getYearPart(date);
  //   let month = this.getMonthPart(date);

  //   return `${year}/${month}`;
  // }

  getMonthStr(item: { dateValue: string }) {
    let year = item.dateValue.split('-')[0];
    let month = item.dateValue.split('-')[1];

    return `${year}/${month}`;
  }

  // getDayString(date: Date) {
  //   let year = this.getYearPart(date);
  //   let month = this.getMonthPart(date);
  //   let day = this.getDayPart(date);

  //   return `${year}/${month}/${day}`;
  // }

  getDayStr(item: { dateValue: string }) {
    let date = item.dateValue.split('-').join('/');

    return `${date}`;
  }

  getHourStr(item: { dateValue: string; timeValue: string }) {
    let date = item.dateValue.split('-').join('/');
    let hour = item.timeValue.split(':')[0];

    return `${date} ${hour}`;
  }

  getMinuteStr(item: { dateValue: string; timeValue: string }) {
    let date = item.dateValue.split('-').join('/');
    let hour = item.timeValue.split(':')[0];
    let minute = item.timeValue.split(':')[1];

    return `${date} ${hour}:${minute}`;
  }

  // getHourString(date: Date) {
  //   let year = this.getYearPart(date);
  //   let month = this.getMonthPart(date);
  //   let day = this.getDayPart(date);
  //   let hour = this.getHourPart(date);

  //   return `${year}/${month}/${day} ${hour}`;
  // }

  // getMinuteString(date: Date) {
  //   let year = this.getYearPart(date);
  //   let month = this.getMonthPart(date);
  //   let day = this.getDayPart(date);
  //   let hour = this.getHourPart(date);
  //   let minute = this.getMinutePart(date);

  //   return `${year}/${month}/${day} ${hour}:${minute}`;
  // }

  // parts

  // getYearPart(date: Date) {
  //   let fullYear = date.getFullYear();
  //   let fullYearString = fullYear.toString();
  //   let fullYearStringLength = fullYearString.length;

  //   let year =
  //     fullYearStringLength === 1
  //       ? `000${fullYear}`
  //       : fullYearStringLength === 2
  //       ? `00${fullYear}`
  //       : fullYearStringLength === 3
  //       ? `0${fullYear}`
  //       : `${fullYear}`;

  //   return `${year}`;
  // }

  // getMonthPart(date: Date) {
  //   let month =
  //     (date.getMonth() + 1).toString().length > 1
  //       ? date.getMonth() + 1
  //       : `0${date.getMonth() + 1}`;

  //   return `${month}`;
  // }

  // getDayPart(date: Date) {
  //   let day =
  //     date.getDate().toString().length > 1
  //       ? date.getDate()
  //       : `0${date.getDate()}`;

  //   return `${day}`;
  // }

  // getHourPart(date: Date) {
  //   let hour =
  //     date.getHours().toString().length > 1
  //       ? date.getHours()
  //       : `0${date.getHours()}`;

  //   return `${hour}`;
  // }

  // getMinutePart(date: Date) {
  //   let minute =
  //     date.getMinutes().toString().length > 1
  //       ? date.getMinutes()
  //       : `0${date.getMinutes()}`;

  //   return `${minute}`;
  // }

  //

  buildFractionRange(item: {
    dateValue: string;
    timeValue: string;
    dateToValue: string;
    timeToValue: string;
  }) {
    let { dateValue, timeValue, dateToValue, timeToValue } = item;

    let minuteStr = this.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue
    });

    let minuteToStr = this.getMinuteStr({
      dateValue: dateToValue,
      timeValue: timeToValue
    });

    this.fraction = {
      brick: `on ${minuteStr} to ${minuteToStr}`,
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

      // tsDateYear: this.date.getFullYear(),
      // tsDateMonth: this.date.getMonth() + 1,
      // tsDateDay: this.date.getDate(),
      // tsDateHour: this.date.getHours(),
      // tsDateMinute: this.date.getMinutes(),

      // tsDateToYear: this.dateTo.getFullYear(),
      // tsDateToMonth: this.dateTo.getMonth() + 1,
      // tsDateToDay: this.dateTo.getDate(),
      // tsDateToHour: this.dateTo.getHours(),
      // tsDateToMinute: this.dateTo.getMinutes()
    };
  }

  buildFractionBeforeDate(item: { dateValue: string; timeValue: string }) {
    let { dateValue, timeValue } = item;

    let minuteStr = this.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue
    });

    let newTsForOption =
      this.fraction.tsForOption || common.FractionTsForOptionEnum.ForInfinity;

    this.fraction = {
      brick:
        newTsForOption === common.FractionTsForOptionEnum.ForInfinity
          ? `before ${minuteStr}`
          : `before ${minuteStr} for ${this.fraction.tsForValue} ${this.fraction.tsForUnit}`,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsBeforeDate,
      // tsDateYear: this.date.getFullYear(),
      // tsDateMonth: this.date.getMonth() + 1,
      // tsDateDay: this.date.getDate(),
      // tsDateHour: this.date.getHours(),
      // tsDateMinute: this.date.getMinutes(),

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

  buildFractionAfterDate(item: { dateValue: string; timeValue: string }) {
    let { dateValue, timeValue } = item;

    let minuteStr = this.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue
    });

    let newTsForOption =
      this.fraction.tsForOption || common.FractionTsForOptionEnum.ForInfinity;

    this.fraction = {
      brick:
        newTsForOption === common.FractionTsForOptionEnum.ForInfinity
          ? `after ${minuteStr}`
          : `after ${minuteStr} for ${this.fraction.tsForValue} ${this.fraction.tsForUnit}`,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsAfterDate,

      // tsDateYear: this.date.getFullYear(),
      // tsDateMonth: this.date.getMonth() + 1,
      // tsDateDay: this.date.getDate(),
      // tsDateHour: this.date.getHours(),
      // tsDateMinute: this.date.getMinutes(),
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
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        let onYearStr = this.getYearStr({
          dateValue: value
        });

        this.fraction = {
          brick: `on ${onYearStr}`,
          operator: this.fraction.operator,
          type: this.fraction.type,
          tsDateYear: Number(value.split('-')[0])
        };

        console.log(this.fraction);
        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerOnYear.blur();
        }, 1);
      }
    }
  }

  // yearOpenClose() {
  //   if (this.date.getFullYear() !== this.fraction.tsDateYear) {
  //     this.fraction = {
  //       brick: `on ${this.getYearString(this.date)}`,
  //       operator: this.fraction.operator,
  //       type: this.fraction.type,
  //       tsDateYear: this.date.getFullYear()
  //     };

  //     this.emitFractionUpdate();
  //   }
  // }

  monthDateValueChanged(x: any) {
    let datePickerOnMonth = this.datePickerOnMonth?.nativeElement;
    if (common.isDefined(datePickerOnMonth)) {
      let value = datePickerOnMonth.value;
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        let onMonthStr = this.getMonthStr({
          dateValue: value
        });

        this.fraction = {
          brick: `on ${onMonthStr}`,
          operator: this.fraction.operator,
          type: this.fraction.type,
          tsDateYear: Number(value.split('-')[0]),
          tsDateMonth: Number(value.split('-')[1].replace(/^0+/, ''))
        };

        console.log(this.fraction);
        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerOnMonth.blur();
        }, 1);
      }
    }
  }

  // monthOpenClose() {
  //   if (
  //     this.date.getFullYear() !== this.fraction.tsDateYear ||
  //     this.date.getMonth() + 1 !== this.fraction.tsDateMonth
  //   ) {
  //     this.fraction = {
  //       brick: `on ${this.getMonthString(this.date)}`,
  //       operator: this.fraction.operator,
  //       type: this.fraction.type,
  //       tsDateYear: this.date.getFullYear(),
  //       tsDateMonth: this.date.getMonth() + 1
  //     };

  //     this.emitFractionUpdate();
  //   }
  // }

  dayDateValueChanged(x: any) {
    let datePickerOnDay = this.datePickerOnDay?.nativeElement;
    if (common.isDefined(datePickerOnDay)) {
      let value = datePickerOnDay.value;
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        let onDayStr = this.getDayStr({
          dateValue: value
        });

        this.fraction = {
          brick: `on ${onDayStr}`,
          operator: this.fraction.operator,
          type: this.fraction.type,
          tsDateYear: Number(value.split('-')[0]),
          tsDateMonth: Number(value.split('-')[1].replace(/^0+/, '')),
          tsDateDay: Number(value.split('-')[2].replace(/^0+/, ''))
        };

        console.log(this.fraction);
        this.emitFractionUpdate();

        setTimeout(() => {
          datePickerOnDay.blur();
        }, 1);
      }
    }
  }

  // dayOpenClose() {
  //   if (
  //     this.date.getFullYear() !== this.fraction.tsDateYear ||
  //     this.date.getMonth() + 1 !== this.fraction.tsDateMonth ||
  //     this.date.getDate() !== this.fraction.tsDateDay
  //   ) {
  //     this.fraction = {
  //       brick: `on ${this.getDayString(this.date)}`,
  //       operator: this.fraction.operator,
  //       type: this.fraction.type,
  //       tsDateYear: this.date.getFullYear(),
  //       tsDateMonth: this.date.getMonth() + 1,
  //       tsDateDay: this.date.getDate()
  //     };

  //     this.emitFractionUpdate();
  //   }
  // }

  hourDateValueChanged(x: any) {
    let datePickerOnHour = this.datePickerOnHour?.nativeElement;
    if (common.isDefined(datePickerOnHour)) {
      let value = datePickerOnHour.value;
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        let onHourStr = this.getHourStr({
          dateValue: value,
          timeValue: this.timeStr
        });

        this.fraction = {
          brick: `on ${onHourStr}`,
          operator: this.fraction.operator,
          type: this.fraction.type,
          tsDateYear: Number(value.split('-')[0]),
          tsDateMonth: Number(value.split('-')[1].replace(/^0+/, '')),
          tsDateDay: Number(value.split('-')[2].replace(/^0+/, '')),
          tsDateHour: Number(this.timeStr.split(':')[0].replace(/^0+/, ''))
        };

        console.log(this.fraction);
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
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeStr = value;

        let onHourStr = this.getHourStr({
          dateValue: this.dateStr,
          timeValue: value
        });

        this.fraction = {
          brick: `on ${onHourStr}`,
          operator: this.fraction.operator,
          type: this.fraction.type,
          tsDateYear: Number(this.dateStr.split('-')[0]),
          tsDateMonth: Number(this.dateStr.split('-')[1].replace(/^0+/, '')),
          tsDateDay: Number(this.dateStr.split('-')[2].replace(/^0+/, '')),
          tsDateHour: Number(value.split(':')[0].replace(/^0+/, ''))
        };

        console.log(this.fraction);
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

  // hourOpenClose() {
  //   if (
  //     this.date.getFullYear() !== this.fraction.tsDateYear ||
  //     this.date.getMonth() + 1 !== this.fraction.tsDateMonth ||
  //     this.date.getDate() !== this.fraction.tsDateDay ||
  //     this.date.getHours() !== this.fraction.tsDateHour ||
  //     this.date.getMinutes() !== 0 ||
  //     this.date.getSeconds() !== 0
  //   ) {
  //     this.fraction = {
  //       brick: `on ${this.getHourString(this.date)}`,
  //       operator: this.fraction.operator,
  //       type: this.fraction.type,
  //       tsDateYear: this.date.getFullYear(),
  //       tsDateMonth: this.date.getMonth() + 1,
  //       tsDateDay: this.date.getDate(),
  //       tsDateHour: this.date.getHours()
  //     };

  //     this.emitFractionUpdate();
  //   }
  // }

  minuteDateValueChanged(x: any) {
    let datePickerOnMinute = this.datePickerOnMinute?.nativeElement;
    if (common.isDefined(datePickerOnMinute)) {
      let value = datePickerOnMinute.value;
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        let onMinuteStr = this.getMinuteStr({
          dateValue: value,
          timeValue: this.timeStr
        });

        this.fraction = {
          brick: `on ${onMinuteStr}`,
          operator: this.fraction.operator,
          type: this.fraction.type,
          tsDateYear: Number(value.split('-')[0]),
          tsDateMonth: Number(value.split('-')[1].replace(/^0+/, '')),
          tsDateDay: Number(value.split('-')[2].replace(/^0+/, '')),
          tsDateHour: Number(this.timeStr.split(':')[0].replace(/^0+/, ''))
        };

        console.log(this.fraction);
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
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeStr = value;

        let onMinuteStr = this.getMinuteStr({
          dateValue: this.dateStr,
          timeValue: value
        });

        this.fraction = {
          brick: `on ${onMinuteStr}`,
          operator: this.fraction.operator,
          type: this.fraction.type,
          tsDateYear: Number(this.dateStr.split('-')[0]),
          tsDateMonth: Number(this.dateStr.split('-')[1].replace(/^0+/, '')),
          tsDateDay: Number(this.dateStr.split('-')[2].replace(/^0+/, '')),
          tsDateHour: Number(value.split(':')[0].replace(/^0+/, '')),
          tsDateMinute: Number(value.split(':')[1].replace(/^0+/, ''))
        };

        console.log(this.fraction);
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

  // minuteOpenClose() {
  //   if (this.isDateNotEqualFractionDateZeroSeconds()) {
  //     this.fraction = {
  //       brick: `on ${this.getMinuteString(this.date)}`,
  //       operator: common.FractionOperatorEnum.Or,
  //       type: common.FractionTypeEnum.TsIsOnMinute,
  //       tsDateYear: this.date.getFullYear(),
  //       tsDateMonth: this.date.getMonth() + 1,
  //       tsDateDay: this.date.getDate(),
  //       tsDateHour: this.date.getHours(),
  //       tsDateMinute: this.date.getMinutes()
  //     };

  //     this.emitFractionUpdate();
  //   }
  // }

  // isDateNotEqualFractionDateZeroSeconds(): boolean {
  //   return (
  //     this.date.getFullYear() !== this.fraction.tsDateYear ||
  //     this.date.getMonth() + 1 !== this.fraction.tsDateMonth ||
  //     this.date.getDate() !== this.fraction.tsDateDay ||
  //     this.date.getHours() !== this.fraction.tsDateHour ||
  //     this.date.getMinutes() !== this.fraction.tsDateMinute ||
  //     this.date.getSeconds() !== 0
  //   );
  // }

  // isDateToNotEqualFractionDateToZeroSeconds(): boolean {
  //   return (
  //     this.dateTo.getFullYear() !== this.fraction.tsDateToYear ||
  //     this.dateTo.getMonth() + 1 !== this.fraction.tsDateToMonth ||
  //     this.dateTo.getDate() !== this.fraction.tsDateToDay ||
  //     this.dateTo.getHours() !== this.fraction.tsDateToHour ||
  //     this.dateTo.getMinutes() !== this.fraction.tsDateToMinute ||
  //     this.dateTo.getSeconds() !== 0
  //   );
  // }

  inRangeFromDateValueChanged(x: any) {
    let datePickerInRangeFrom = this.datePickerInRangeFrom?.nativeElement;
    if (common.isDefined(datePickerInRangeFrom)) {
      let value = datePickerInRangeFrom.value;
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        //   if (this.isDateNotEqualFractionDateZeroSeconds()) {
        this.buildFractionRange({
          dateValue: value,
          timeValue: this.timeStr,
          dateToValue: this.dateToStr,
          timeToValue: this.timeToStr
        });

        console.log(this.fraction);
        this.emitFractionUpdate();
        // }

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
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeStr = value;

        //   if (this.isDateNotEqualFractionDateZeroSeconds()) {
        this.buildFractionRange({
          dateValue: this.dateStr,
          timeValue: value,
          dateToValue: this.dateToStr,
          timeToValue: this.timeToStr
        });

        console.log(this.fraction);
        this.emitFractionUpdate();
        // }

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

  // rangeFromOpenClose() {
  //   if (this.isDateNotEqualFractionDateZeroSeconds()) {
  //     this.buildFractionRange();

  //     this.emitFractionUpdate();
  //   }
  // }

  inRangeToDateValueChanged(x: any) {
    let datePickerInRangeTo = this.datePickerInRangeTo?.nativeElement;
    if (common.isDefined(datePickerInRangeTo)) {
      let value = datePickerInRangeTo.value;
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateToStr = value;

        //   if (this.isDateNotEqualFractionDateZeroSeconds()) {
        this.buildFractionRange({
          dateValue: this.dateStr,
          timeValue: this.timeStr,
          dateToValue: value,
          timeToValue: this.timeToStr
        });

        console.log(this.fraction);
        this.emitFractionUpdate();
        // }

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
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeToStr = value;

        //   if (this.isDateToNotEqualFractionDateToZeroSeconds()) {
        this.buildFractionRange({
          dateValue: this.dateStr,
          timeValue: this.timeStr,
          dateToValue: this.dateToStr,
          timeToValue: value
        });

        console.log(this.fraction);
        this.emitFractionUpdate();
        // }

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

  // rangeToOpenClose() {
  //   if (this.isDateToNotEqualFractionDateToZeroSeconds()) {
  //     this.buildFractionRange();

  //     this.emitFractionUpdate();
  //   }
  // }

  // disabledMinutes() {
  //   return [0];
  // }

  // disabledSeconds() {
  //   return [0];
  // }

  beforeDateValueChanged(x: any) {
    let datePickerBefore = this.datePickerBefore?.nativeElement;
    if (common.isDefined(datePickerBefore)) {
      let value = datePickerBefore.value;
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        // if (this.isDateNotEqualFractionDateZeroSeconds()) {
        this.buildFractionBeforeDate({
          dateValue: value,
          timeValue: this.timeStr
        });

        if (
          this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
          this.tsForValueForm.valid
        ) {
          console.log(this.fraction);
          this.emitFractionUpdate();
        }
        // }

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
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeStr = value;

        // if (this.isDateNotEqualFractionDateZeroSeconds()) {
        this.buildFractionBeforeDate({
          dateValue: this.dateStr,
          timeValue: value
        });

        if (
          this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
          this.tsForValueForm.valid
        ) {
          console.log(this.fraction);
          this.emitFractionUpdate();
        }
        // }

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

  // beforeOpenClose() {
  //   if (this.isDateNotEqualFractionDateZeroSeconds()) {
  //     this.buildFractionBeforeDate();

  //     if (
  //       this.fraction.tsForOption ===
  //         common.FractionTsForOptionEnum.ForInfinity ||
  //       this.tsForValueForm.valid
  //     ) {
  //       this.emitFractionUpdate();
  //     }
  //   }
  // }

  afterDateValueChanged(x: any) {
    let datePickerAfter = this.datePickerAfter?.nativeElement;
    if (common.isDefined(datePickerAfter)) {
      let value = datePickerAfter.value;
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.dateStr = value;

        // if (this.isDateNotEqualFractionDateZeroSeconds()) {
        this.buildFractionAfterDate({
          dateValue: value,
          timeValue: this.timeStr
        });

        if (
          this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
          this.tsForValueForm.valid
        ) {
          console.log(this.fraction);
          this.emitFractionUpdate();
        }
        // }

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
      console.log('value');
      console.log(value);

      if (common.isDefinedAndNotEmpty(value)) {
        this.timeStr = value;

        // if (this.isDateNotEqualFractionDateZeroSeconds()) {
        this.buildFractionAfterDate({
          dateValue: this.dateStr,
          timeValue: value
        });

        if (
          this.fraction.tsForOption ===
            common.FractionTsForOptionEnum.ForInfinity ||
          this.tsForValueForm.valid
        ) {
          console.log(this.fraction);
          this.emitFractionUpdate();
        }
        // }

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

  // afterOpenClose() {
  //   if (this.isDateNotEqualFractionDateZeroSeconds()) {
  //     this.buildFractionAfterDate();

  //     if (
  //       this.fraction.tsForOption ===
  //         common.FractionTsForOptionEnum.ForInfinity ||
  //       this.tsForValueForm.valid
  //     ) {
  //       this.emitFractionUpdate();
  //     }
  //   }
  // }

  relativeValueBlur() {
    let value = this.tsRelativeValueForm.controls['tsRelativeValue'].value;

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
    let value =
      this.tsRelativeCompleteForm.controls['tsRelativeCompleteOption'].value;

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
    this.fraction.tsForUnit = this.tsForUnitForm.controls['tsForUnit'].value;
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
    if (this.fraction.type === common.FractionTypeEnum.TsIsBeforeDate) {
      this.buildFractionBeforeDate({
        dateValue: this.dateStr,
        timeValue: this.timeStr
      });
    }

    if (this.fraction.type === common.FractionTypeEnum.TsIsAfterDate) {
      this.buildFractionAfterDate({
        dateValue: this.dateStr,
        timeValue: this.timeStr
      });
    }

    if (this.fraction.type === common.FractionTypeEnum.TsIsBeforeRelative) {
      this.buildFractionBeforeRelative();
    }
    if (this.fraction.type === common.FractionTypeEnum.TsIsAfterRelative) {
      this.buildFractionAfterRelative();
    }

    this.updateForControls();

    if (
      ([
        common.FractionTypeEnum.TsIsBeforeRelative,
        common.FractionTypeEnum.TsIsAfterRelative
      ].indexOf(this.fraction.type) < 0 ||
        this.tsRelativeValueForm.valid) &&
      (this.fraction.tsForOption ===
        common.FractionTsForOptionEnum.ForInfinity ||
        this.tsForValueForm.valid)
    ) {
      this.emitFractionUpdate();
    }
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
    this.fraction.tsLastUnit = this.tsLastUnitForm.controls['tsLastUnit'].value;

    this.buildFractionLast();

    if (this.tsLastValueForm.valid) {
      this.emitFractionUpdate();
    }
  }

  tsLastCompleteOptionChange() {
    this.fraction.tsLastCompleteOption =
      this.tsLastCompleteOptionForm.controls['tsLastCompleteOption'].value;

    this.buildFractionLast();

    if (this.tsLastValueForm.valid) {
      this.emitFractionUpdate();
    }
  }

  buildFractionLast() {
    this.fraction = {
      brick:
        this.fraction.tsLastCompleteOption ===
        common.FractionTsLastCompleteOptionEnum.Incomplete
          ? `last ${this.fraction.tsLastValue} ${this.fraction.tsLastUnit}`
          : this.fraction.tsLastCompleteOption ===
            common.FractionTsLastCompleteOptionEnum.Complete
          ? `last ${this.fraction.tsLastValue} ${this.fraction.tsLastUnit} complete`
          : `last ${this.fraction.tsLastValue} ${this.fraction.tsLastUnit} complete plus current`,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsInLast,

      tsLastValue: this.fraction.tsLastValue,
      tsLastUnit: this.fraction.tsLastUnit,
      tsLastCompleteOption: this.fraction.tsLastCompleteOption
    };
  }

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }
}
