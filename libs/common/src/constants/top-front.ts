import { DatePickerDate, DatePickerI18n } from '@vaadin/date-picker';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { MconfigField } from '~common/interfaces/backend/mconfig-field';
import { RefreshItem } from '~common/interfaces/front/refresh-item';

export const SPECIAL_ERROR = 'SPECIAL_ERROR';
export const PASSWORD_RESET_EMAIL = 'PASSWORD_RESET_EMAIL';
export const MIN_TIME_TO_SPIN = 0;

export const LOCAL_STORAGE_TOKEN = 'token';
export const LOCAL_STORAGE_ORG_ID = 'orgId';
export const LOCAL_STORAGE_PROJECT_ID = 'projectId';
export const LOCAL_STORAGE_DELETED_ORG_NAME = 'deletedOrgName';
export const LOCAL_STORAGE_CHANGED_OWNER_ORG_NAME = 'changedOwnerOrgName';
export const LOCAL_STORAGE_DELETED_PROJECT_NAME = 'deletedProjectName';
export const LOCAL_STORAGE_NEW_ORG_OWNER = 'newOrgOwner';

export const LIGHT_PLUS_LANGUAGES = ['malloy', 'malloysql', 'malloynb'];

export const DEFAULT_METRICS_COLUMN_NAME_WIDTH = 530;
export const DEFAULT_METRICS_TIME_COLUMNS_NARROW_WIDTH = 155;
export const DEFAULT_METRICS_TIME_COLUMNS_WIDE_WIDTH = 220;

export const DEFAULT_TIME_SPEC = TimeSpecEnum.Days;

// export const DEFAULT_TIME_RANGE_FRACTION: Fraction = {
//   brick: 'last 5 days',
//   operator: FractionOperatorEnum.Or,
//   tsLastCompleteOption:
//     FractionTsLastCompleteOptionEnum.CompletePlusCurrent,
//   tsLastUnit: FractionTsLastUnitEnum.Days,
//   tsLastValue: 5,
//   type: FractionTypeEnum.TsIsInLast
// };

export const MEMBERS_PER_PAGE = 10;
export const USERS_PER_PAGE = 10;

export const BLOCKML_EXT_LIST: FileExtensionEnum[] = [
  FileExtensionEnum.Store,
  FileExtensionEnum.Report,
  FileExtensionEnum.Dashboard,
  FileExtensionEnum.Chart
];

export const RESULTS_LIST: FieldResultEnum[] = [
  FieldResultEnum.String,
  FieldResultEnum.Number,
  FieldResultEnum.Boolean,
  FieldResultEnum.Ts,
  FieldResultEnum.Date
  //
  // FieldResultEnum.Array,
  // FieldResultEnum.Record,
  // FieldResultEnum.Json,
  // FieldResultEnum.SqlNative,
  //
  // FieldResultEnum.DayOfWeek,
  // FieldResultEnum.DayOfWeekIndex,
  // FieldResultEnum.MonthName,
  // FieldResultEnum.QuarterOfYear,
];

export const APP_SPINNER_NAME = 'app';

export const FORMAT_NUMBER_DECIMAL = '.';
export const FORMAT_NUMBER_GROUPING = [3];
export const FORMAT_NUMBER_EXAMPLES: {
  id: string;
  input: number;
  output: string;
}[] = [
  {
    id: ',.0f',
    input: 1000.12345,
    output: undefined
  },
  {
    id: ',.2f',
    input: 1000.12345,
    output: undefined
  },
  {
    id: '$,.0f',
    input: 1000.12345,
    output: undefined
  },
  {
    id: '$,.2f',
    input: 1000.12345,
    output: undefined
  },
  {
    id: '$',
    input: 1000.12345,
    output: undefined
  },
  {
    id: '.0%',
    input: 1000.12345,
    output: undefined
  },
  {
    id: '.2%',
    input: 1000.12345,
    output: undefined
  },
  {
    id: '%',
    input: 1000.12345,
    output: undefined
  },
  {
    id: 's',
    input: 1000.12345,
    output: undefined
  },
  {
    id: '+',
    input: 300,
    output: undefined
  },
  {
    id: '-',
    input: -900,
    output: undefined
  },
  {
    id: '(',
    input: -900,
    output: undefined
  }
];

export const EMPTY_MCONFIG_FIELD: MconfigField = {
  id: undefined,
  hidden: undefined,
  required: undefined,
  maxFractions: undefined,
  label: undefined,
  fieldClass: undefined,
  result: undefined,
  suggestModelDimension: undefined,
  sqlName: undefined,
  topId: undefined,
  topLabel: 'Empty',
  description: undefined,
  type: undefined,
  groupId: undefined,
  groupLabel: undefined,
  groupDescription: undefined,
  formatNumber: undefined,
  currencyPrefix: undefined,
  currencySuffix: undefined,
  sorting: undefined,
  sortingNumber: undefined
  // isHideColumn: undefined
};

export const COMMON_I18N: DatePickerI18n = {
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
  firstDayOfWeek: 0, // adjusted in ngOnInit of fraction-ts
  week: 'Week',
  calendar: 'Calendar',
  today: 'Today',
  cancel: 'Cancel',
  referenceDate: '',
  formatDate: (d: DatePickerDate) => {
    let monthIndex = d.month + 1;
    let month =
      monthIndex.toString().length === 1 ? `0${monthIndex}` : `${monthIndex}`;

    let day = d.day.toString().length === 1 ? `0${d.day}` : `${d.day}`;

    return `${d.year}-${month}-${day}`;
  },
  parseDate: null,
  formatTitle: (monthName: any, fullYear: any) => monthName + '  ' + fullYear
};

export const REFRESH_LIST: RefreshItem[] = [
  {
    label: '1-time',
    value: 0
  },
  // {
  //   label: '1s',
  //   value: 1
  // },
  {
    label: '5s',
    value: 5
  },
  {
    label: '10s',
    value: 10
  },
  {
    label: '15s',
    value: 15
  },
  {
    label: '30s',
    value: 30
  },
  {
    label: '1m',
    value: 1 * 60
  },
  {
    label: '5m',
    value: 5 * 60
  },
  {
    label: '10m',
    value: 10 * 60
  },
  {
    label: '15m',
    value: 15 * 60
  },
  {
    label: '30m',
    value: 30 * 60
  },
  {
    label: '1h',
    value: 1 * 60 * 60
  },
  {
    label: '2h',
    value: 2 * 60 * 60
  },
  {
    label: '4h',
    value: 4 * 60 * 60
  },
  {
    label: '6h',
    value: 6 * 60 * 60
  },
  {
    label: '8h',
    value: 8 * 60 * 60
  },
  {
    label: '12h',
    value: 12 * 60 * 60
  },
  {
    label: '24h',
    value: 24 * 60 * 60
  }
];
