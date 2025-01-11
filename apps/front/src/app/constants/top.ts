import { common } from '~front/barrels/common';

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

export const DEFAULT_TIME_SPEC = common.TimeSpecEnum.Days;

export const DEFAULT_TIME_RANGE_FRACTION: common.Fraction = {
  brick: 'last 5 days',
  operator: common.FractionOperatorEnum.Or,
  tsLastCompleteOption:
    common.FractionTsLastCompleteOptionEnum.CompletePlusCurrent,
  tsLastUnit: common.FractionTsLastUnitEnum.Days,
  tsLastValue: 5,
  type: common.FractionTypeEnum.TsIsInLast
};

export const MEMBERS_PER_PAGE = 10;
export const USERS_PER_PAGE = 10;
export const CONNECTIONS_PER_PAGE = 10;
export const ENVIRONMENTS_PER_PAGE = 10;

export const MARKDOWN_LANGUAGE_ID = 'markdown';
export const YAML_LANGUAGE_ID = 'yaml';
export const SQL_LANGUAGE_ID = 'sql';

export const TEXTMATE_THEME = 'textmate';
export const BLOCKML_THEME = 'blockml';

export const BLOCKML_EXT_LIST: common.FileExtensionEnum[] = [
  common.FileExtensionEnum.View,
  common.FileExtensionEnum.Model,
  common.FileExtensionEnum.Report,
  common.FileExtensionEnum.Dashboard,
  common.FileExtensionEnum.Chart,
  common.FileExtensionEnum.Udf
];

export const RESULT_LIST: common.FieldResultEnum[] = [
  common.FieldResultEnum.String,
  common.FieldResultEnum.Number,
  common.FieldResultEnum.Yesno,
  common.FieldResultEnum.Ts,
  common.FieldResultEnum.QuarterOfYear,
  common.FieldResultEnum.MonthName,
  common.FieldResultEnum.DayOfWeek,
  common.FieldResultEnum.DayOfWeekIndex
];

export const APP_SPINNER_NAME = 'app';

export const FORMAT_NUMBER_DECIMAL = '.';
export const FORMAT_NUMBER_THOUSANDS = ' ';
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

export const EMPTY_MCONFIG_FIELD: common.MconfigField = {
  id: undefined,
  hidden: undefined,
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
  sortingNumber: undefined,
  isHideColumn: undefined
};
