import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { DetailUnitEnum } from '#common/enums/detail-unit.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { FieldTypeEnum } from '#common/enums/field-type.enum';
import { FractionLogicEnum } from '#common/enums/fraction/fraction-logic.enum';
import { ProjectWeekStartEnum } from '#common/enums/project-week-start.enum';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { StoreMethodEnum } from '#common/enums/store-method.enum';
import { OptionsStoreGoogleApi } from '#common/interfaces/backend/connection-parts/options-store-google-api';

export const MPROVE_CONFIG_FILENAME = 'mprove.yml';
export const MPROVE_CONFIG_NAME = 'mprove';

export const MPROVE_CONFIG_DIR_DOT_SLASH = './';

export const MPROVE_CACHE_DIR = '.mprove';
export const MPROVE_SYNC_FILENAME = 'sync.json';

export const UTC = 'UTC';

export const MALLOY_FILTER_ANY = 'f``';

export const PROJECT_CONFIG_ALLOW_TIMEZONES = 'true';
export const PROJECT_CONFIG_CASE_SENSITIVE_STRING_FILTERS = 'false';
export const PROJECT_CONFIG_DEFAULT_TIMEZONE = UTC;
export const PROJECT_CONFIG_WEEK_START = ProjectWeekStartEnum.Sunday;
export const PROJECT_CONFIG_CURRENCY_PREFIX = '$';
export const PROJECT_CONFIG_CURRENCY_SUFFIX = '';
export const PROJECT_CONFIG_THOUSANDS_SEPARATOR = ',';
export const PROJECT_CONFIG_FORMAT_NUMBER = '';

export const MF = 'mf';

export const PROD_REPO_ID = 'production';
export const BRANCH_MAIN = 'main'; // also set as string in project default_branch
export const PROJECT_ENV_PROD = 'prod';

export const EMPTY_STORE_GOOGLE_API_OPTIONS: OptionsStoreGoogleApi = {
  baseUrl: 'https://analyticsdata.googleapis.com',
  headers: [],
  googleAuthScopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  serviceAccountCredentials: undefined,
  googleCloudProject: undefined,
  googleCloudClientEmail: undefined,
  googleAccessToken: undefined,
  googleAccessTokenExpiryDate: undefined
};

export const REPORT_ROW_DEFAULT_SHOW_CHART = false;

export const DASHBOARD_FIELD_DEFAULT_HIDDEN = false;
export const REPORT_FIELD_DEFAULT_HIDDEN = false;

export const TILE_DEFAULT_PLATE_WIDTH = 12;
export const TILE_DEFAULT_PLATE_HEIGHT = 10;
export const TILE_DEFAULT_PLATE_X = 0;
export const TILE_DEFAULT_PLATE_Y = 0;

export const UNDEF = 'UNDEF';

export const EMPTY_STRUCT_ID = 'EMPTY_STRUCT_ID';

export const ROW_ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const NODEGIT_REMOTE_BRANCH_NOT_FOUND =
  'cannot locate remote-tracking branch';

export const NODEGIT_LOCAL_BRANCH_NOT_FOUND = 'cannot locate local branch';

export const NODEGIT_PATH_NOT_EXIST_IN_TREE =
  'does not exist in the given tree';

export const DEMO_ORG_NAME = 'demo';

export const RESTRICTED_USER_EMAIL = 'demo-user@mprove.io';
export const RESTRICTED_USER_ALIAS = 'demo-user';
export const RESTRICTED_USER_PASSWORD = '123456';

export const README_FILE_NAME = 'readme.md';

export const DOUBLE_UNDERSCORE = '__';
export const TRIPLE_UNDERSCORE = '___';
export const QUAD_UNDERSCORE = '____';
export const DOT_SYMBOL = '_DOT_';

export const MPROVE_TAG_FIELD_GROUP = 'field_group';
export const NO_CAPITALIZE_LIST = [
  // Articles
  'a',
  'an',
  'the',

  // Coordinating Conjunctions
  'and',
  'but',
  'or',
  'nor',
  'for',
  'so',
  'yet',

  // Common Short Prepositions (≤4 letters, per APA/MLA style)
  'as',
  'at',
  'by',
  'for',
  'from',
  'in',
  'into',
  'like',
  'near',
  'of',
  'off',
  'on',
  'onto',
  'out',
  'over',
  'per',
  'to',
  'up',
  'via',
  'with'
];

export const SOME_ROWS_HAVE_FORMULA_ERRORS = 'Some rows have formula errors';

export const USE_PROJECT_TIMEZONE_VALUE = 'USE_PROJECT_TIMEZONE';
export const USE_PROJECT_TIMEZONE_LABEL = 'USE PROJECT CONFIG TIMEZONE';

export const TIME_COLUMNS_LIMIT = 100;

export const STORE_MODEL_PREFIX = 'store_model';

export const METRIC_ID_BY = 'by';

export const DEFAULT_LIMIT = '500';

export const MPROVE_USERS_FOLDER = 'mprove-users';

export const PATH_REGISTER = 'register';
export const PATH_VERIFY_EMAIL = 'verify-email';
export const PATH_CONFIRM_EMAIL = 'confirm-email';
export const PATH_EMAIL_CONFIRMED = 'email-confirmed';
export const PATH_COMPLETE_REGISTRATION = 'complete-registration';
export const PATH_LOGIN = 'login';
export const PATH_USER_DELETED = 'user-deleted';
export const PATH_FORGOT_PASSWORD = 'forgot-password';
export const PATH_PASSWORD_RESET_SENT = 'password-reset-sent';
export const PATH_UPDATE_PASSWORD = 'update-password';
export const PATH_NEW_PASSWORD_WAS_SET = 'new-password-was-set';

export const PATH_LOGIN_SUCCESS = 'login-success';
export const PATH_PASSWORD_RESET_SENT_AUTH = 'password-reset-sent-auth';
export const PATH_PROFILE = 'profile';
export const PATH_ENV_VARIABLES = 'env-variables';

export const PATH_FILES = 'files';
export const PATH_FILE = 'file';
export const PATH_MODELS = 'models';
export const PATH_CHART = 'chart';
export const PATH_CHARTS_LIST = 'charts-list';
export const PATH_MODELS_LIST = 'models-list';
export const PATH_MODEL = 'model';
export const PATH_MCONFIG = 'mconfig';
export const PATH_QUERY = 'query';
export const PATH_DASHBOARDS = 'dashboards';
export const PATH_DASHBOARDS_LIST = 'dashboards-list';
export const PATH_DASHBOARD = 'dashboard';
export const PATH_REPORTS = 'reports';
export const PATH_REPORTS_LIST = 'reports-list';
export const PATH_REPORT = 'report';

export const PATH_ORG = 'org';
export const PATH_ACCOUNT = 'account';
export const PATH_USERS = 'users';

export const PATH_ORG_DELETED = 'organization-deleted';
export const PATH_ORG_OWNER_CHANGED = 'organization-owner-changed';

export const PATH_PROJECT_DELETED = 'project-deleted';

export const PARAMETER_ORG_ID = 'orgId';
export const PARAMETER_PROJECT_ID = 'projectId';
export const PARAMETER_REPO_ID = 'repoId';
export const PARAMETER_BRANCH_ID = 'branchId';
export const PARAMETER_ENV_ID = 'envId';
export const PARAMETER_ENVIRONMENT_ID = 'environmentId';
export const PARAMETER_FILE_ID = 'fileId';
export const PARAMETER_MODEL_ID = 'modelId';
export const PARAMETER_DASHBOARD_ID = 'dashboardId';
export const PARAMETER_CHART_ID = 'chartId';
export const PARAMETER_MCONFIG_ID = 'mconfigId';
export const PARAMETER_QUERY_ID = 'queryId';
export const PARAMETER_REPORT_ID = 'reportId';

export const EMPTY_CHART_ID = 'new';
export const EMPTY_MCONFIG_ID = 'new';
export const EMPTY_QUERY_ID = 'new';
export const EMPTY_REPORT_ID = 'new';

export const LAST_SELECTED_FILE_ID = 'last-selected';
export const LAST_SELECTED_MODEL_ID = 'last-selected';
export const LAST_SELECTED_CHART_ID = 'last-selected';
export const LAST_SELECTED_DASHBOARD_ID = 'last-selected';
export const LAST_SELECTED_REPORT_ID = 'last-selected';

export const PATH_PROJECT = 'project';
export const PATH_REPO = 'repo';
export const PATH_BRANCH = 'branch';
export const PATH_ENV = 'env';

export const PATH_INFO = 'info';
export const PATH_CONNECTIONS = 'connections';
export const PATH_ENVIRONMENTS = 'environments';
export const PATH_TEAM = 'team';

export const METHOD_RPC = 'RPC';

export const NO_FIELDS_SELECTED = 'no_fields_selected';

export const FIELD_TYPE_VALUES = [
  FieldTypeEnum.CountDistinct,
  FieldTypeEnum.Sum,
  FieldTypeEnum.SumByKey,
  FieldTypeEnum.Average,
  FieldTypeEnum.AverageByKey,
  FieldTypeEnum.MedianByKey,
  FieldTypeEnum.PercentileByKey,
  FieldTypeEnum.Min,
  FieldTypeEnum.Max,
  FieldTypeEnum.List,
  FieldTypeEnum.Custom,
  FieldTypeEnum.YesnoIsTrue
];

export const FIELD_RESULT_VALUES = [
  FieldResultEnum.String,
  FieldResultEnum.Number,
  FieldResultEnum.DayOfWeek,
  FieldResultEnum.DayOfWeekIndex,
  FieldResultEnum.MonthName,
  FieldResultEnum.QuarterOfYear,
  FieldResultEnum.Ts,
  FieldResultEnum.Yesno
];

export const DIMENSION_TYPE_VALUES = [
  FieldTypeEnum.Custom,
  FieldTypeEnum.YesnoIsTrue
];

export const MEASURE_TYPE_VALUES = [
  FieldTypeEnum.CountDistinct,
  FieldTypeEnum.Sum,
  FieldTypeEnum.SumByKey,
  FieldTypeEnum.Average,
  FieldTypeEnum.AverageByKey,
  FieldTypeEnum.MedianByKey,
  FieldTypeEnum.PercentileByKey,
  FieldTypeEnum.Min,
  FieldTypeEnum.Max,
  FieldTypeEnum.List,
  FieldTypeEnum.Custom
];

export const ALL_RESULT_VALUES = [
  FieldResultEnum.DayOfWeek,
  FieldResultEnum.DayOfWeekIndex,
  FieldResultEnum.MonthName,
  FieldResultEnum.QuarterOfYear,
  FieldResultEnum.Ts,
  FieldResultEnum.Yesno,
  FieldResultEnum.String,
  FieldResultEnum.Number,
  FieldResultEnum.Date,
  FieldResultEnum.Boolean,
  FieldResultEnum.Array,
  FieldResultEnum.Record,
  FieldResultEnum.Json,
  FieldResultEnum.SqlNative
];

export const DIMENSION_RESULT_VALUES = [
  FieldResultEnum.String,
  FieldResultEnum.Number
];

export const MEASURE_RESULT_VALUES = [
  FieldResultEnum.String,
  FieldResultEnum.Number
];

export const CALCULATION_RESULT_VALUES = [
  FieldResultEnum.String,
  FieldResultEnum.Number
];

export const FILTER_RESULT_VALUES = [
  FieldResultEnum.String,
  FieldResultEnum.Number,
  FieldResultEnum.DayOfWeek,
  FieldResultEnum.DayOfWeekIndex,
  FieldResultEnum.MonthName,
  FieldResultEnum.QuarterOfYear,
  FieldResultEnum.Ts,
  FieldResultEnum.Yesno
];

export const CHART_TYPE_VALUES = [
  ChartTypeEnum.Table,
  ChartTypeEnum.Line,
  ChartTypeEnum.Bar,
  ChartTypeEnum.Scatter,
  ChartTypeEnum.Single,
  ChartTypeEnum.Pie
];

export const Y_FIELDS_CHART_TYPE_VALUES = [
  ChartTypeEnum.Line,
  ChartTypeEnum.Bar,
  ChartTypeEnum.Scatter
];

export const PROJECT_WEEK_START_VALUES = [
  ProjectWeekStartEnum.Sunday,
  ProjectWeekStartEnum.Monday
];

export const ROW_TYPE_VALUES = [
  RowTypeEnum.Empty,
  RowTypeEnum.Header,
  RowTypeEnum.Metric,
  RowTypeEnum.Formula
];

export const STORE_METHOD_VALUES = [StoreMethodEnum.Get, StoreMethodEnum.Post];

export const STORE_FIELD_DETAIL_VALUES = [
  DetailUnitEnum.Years,
  DetailUnitEnum.Quarters,
  DetailUnitEnum.Months,
  DetailUnitEnum.WeeksSunday,
  DetailUnitEnum.WeeksMonday,
  DetailUnitEnum.Days,
  DetailUnitEnum.Hours,
  DetailUnitEnum.Minutes,
  DetailUnitEnum.Timestamps
];

export const LOGIC_VALUES = [FractionLogicEnum.Or, FractionLogicEnum.AndNot];
