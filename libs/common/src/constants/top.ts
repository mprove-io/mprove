import { enums } from '~common/barrels/enums';

// export const API_PATH = 'api';
export const MPROVE_CONFIG_FILENAME = 'mprove.yml';
export const MPROVE_CONFIG_NAME = 'mprove';

export const MPROVE_CONFIG_DIR_DOT = '.';
export const MPROVE_CONFIG_DIR_DOT_SLASH = './';

export const MPROVE_CACHE_DIR = '.mprove';
export const MPROVE_SYNC_FILENAME = 'sync.json';

export const PROD_REPO_ID = 'production';
export const BRANCH_MASTER = 'master'; // set as string in db default value
export const BRANCH_MAIN = 'main';
export const PROJECT_ENV_PROD = 'prod';
export const PASS_PHRASE = '';

export const REPORT_ROW_DEFAULT_SHOW_CHART = false;

export const DASHBOARD_FIELD_DEFAULT_HIDDEN = false;
export const REPORT_FIELD_DEFAULT_HIDDEN = false;

export const TILE_DEFAULT_PLATE_WIDTH = 8;
export const TILE_DEFAULT_PLATE_HEIGHT = 12;
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

export const FIRST_ORG_NAME = 'demo';
export const RESTRICTED_USER_ALIAS = 'demo-user';

export const README_FILE_NAME = 'readme.md';

export const TRIPLE_UNDERSCORE = '___';
export const QUAD_UNDERSCORE = '____';

export const SOME_ROWS_HAVE_FORMULA_ERRORS = 'Some rows have formula errors';

export const USE_PROJECT_TIMEZONE_VALUE = 'USE_PROJECT_TIMEZONE';
export const USE_PROJECT_TIMEZONE_LABEL = 'USE PROJECT CONFIG TIMEZONE';
export const UTC = 'UTC';

export const VIEW_MODEL_ALIAS = 'v';
export const VIEW_MODEL_PREFIX = 'view_model';

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
export const PATH_FILES = 'files';
export const PATH_CHARTS = 'charts';
export const PATH_ENV_VARIABLES = 'env-variables';
export const PATH_DASHBOARDS = 'dashboards';
export const PATH_MODELS = 'models';
export const PATH_FILE = 'file';
export const PATH_MODEL = 'model';
export const PATH_DASHBOARD = 'dashboard';
export const PATH_MCONFIG = 'mconfig';
export const PATH_QUERY = 'query';
export const PATH_METRICS = 'metrics';
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
export const PARAMETER_MCONFIG_ID = 'mconfigId';
export const PARAMETER_QUERY_ID = 'queryId';
export const PARAMETER_REPORT_ID = 'reportId';

export const EMPTY_MCONFIG_ID = 'new';
export const EMPTY_QUERY_ID = 'new';
export const EMPTY_REPORT_ID = 'new';
export const LAST_SELECTED_REPORT_ID = 'last-selected';

export const PATH_PROJECT = 'project';
export const PATH_REPO = 'repo';
export const PATH_BRANCH = 'branch';
export const PATH_ENV = 'env';

export const PATH_SETTINGS = 'settings';
export const PATH_CONNECTIONS = 'connections';
export const PATH_ENVIRONMENTS = 'environments';
export const PATH_TEAM = 'team';

export const METHOD_RABBIT = 'RABBIT';

export const GLOBAL_ROW_ID = 'RGL';
export const GLOBAL_ROW_NAME = 'RGL';

export const NO_FIELDS_SELECTED = 'no_fields_selected';

export const FIELD_TYPE_VALUES = [
  enums.FieldTypeEnum.CountDistinct,
  enums.FieldTypeEnum.Sum,
  enums.FieldTypeEnum.SumByKey,
  enums.FieldTypeEnum.Average,
  enums.FieldTypeEnum.AverageByKey,
  enums.FieldTypeEnum.MedianByKey,
  enums.FieldTypeEnum.PercentileByKey,
  enums.FieldTypeEnum.Min,
  enums.FieldTypeEnum.Max,
  enums.FieldTypeEnum.List,
  enums.FieldTypeEnum.Custom,
  enums.FieldTypeEnum.YesnoIsTrue
];

export const FIELD_RESULT_VALUES = [
  enums.FieldResultEnum.String,
  enums.FieldResultEnum.Number,
  enums.FieldResultEnum.DayOfWeek,
  enums.FieldResultEnum.DayOfWeekIndex,
  enums.FieldResultEnum.MonthName,
  enums.FieldResultEnum.QuarterOfYear,
  enums.FieldResultEnum.Ts,
  enums.FieldResultEnum.Yesno
];

export const DIMENSION_TYPE_VALUES = [
  enums.FieldTypeEnum.Custom,
  enums.FieldTypeEnum.YesnoIsTrue
];

export const DIMENSION_RESULT_VALUES = [
  enums.FieldResultEnum.String,
  enums.FieldResultEnum.Number
];

export const MEASURE_TYPE_VALUES = [
  enums.FieldTypeEnum.CountDistinct,
  enums.FieldTypeEnum.Sum,
  enums.FieldTypeEnum.SumByKey,
  enums.FieldTypeEnum.Average,
  enums.FieldTypeEnum.AverageByKey,
  enums.FieldTypeEnum.MedianByKey,
  enums.FieldTypeEnum.PercentileByKey,
  enums.FieldTypeEnum.Min,
  enums.FieldTypeEnum.Max,
  enums.FieldTypeEnum.List,
  enums.FieldTypeEnum.Custom
];

export const MEASURE_RESULT_VALUES = [
  enums.FieldResultEnum.String,
  enums.FieldResultEnum.Number
];

export const CALCULATION_RESULT_VALUES = [
  enums.FieldResultEnum.String,
  enums.FieldResultEnum.Number
];

export const FILTER_RESULT_VALUES = [
  enums.FieldResultEnum.String,
  enums.FieldResultEnum.Number,
  enums.FieldResultEnum.DayOfWeek,
  enums.FieldResultEnum.DayOfWeekIndex,
  enums.FieldResultEnum.MonthName,
  enums.FieldResultEnum.QuarterOfYear,
  enums.FieldResultEnum.Ts,
  enums.FieldResultEnum.Yesno
];

export const CHART_TYPE_VALUES = [
  enums.ChartTypeEnum.Table,
  //
  enums.ChartTypeEnum.ELine,
  enums.ChartTypeEnum.EBar,
  enums.ChartTypeEnum.EScatter,
  enums.ChartTypeEnum.EPie,
  enums.ChartTypeEnum.EHeatMap,
  enums.ChartTypeEnum.ETreeMap,
  enums.ChartTypeEnum.EGauge
  //
  // enums.ChartTypeEnum.AgLine,
  // enums.ChartTypeEnum.AgArea,
  // enums.ChartTypeEnum.AgBar,
  // enums.ChartTypeEnum.AgScatter,
  // enums.ChartTypeEnum.AgBubble,
  // enums.ChartTypeEnum.AgPie,
  // enums.ChartTypeEnum.AgDonut,
  //
  // enums.ChartTypeEnum.Area,
  // enums.ChartTypeEnum.AreaNormalized,
  // enums.ChartTypeEnum.AreaStacked,
  // enums.ChartTypeEnum.BarHorizontal,
  // enums.ChartTypeEnum.BarHorizontalGrouped,
  // enums.ChartTypeEnum.BarHorizontalNormalized,
  // enums.ChartTypeEnum.BarHorizontalStacked,
  // enums.ChartTypeEnum.BarVertical,
  // enums.ChartTypeEnum.BarVerticalGrouped,
  // enums.ChartTypeEnum.BarVerticalNormalized,
  // enums.ChartTypeEnum.BarVerticalStacked,
  // enums.ChartTypeEnum.Gauge,
  // enums.ChartTypeEnum.GaugeLinear,
  // enums.ChartTypeEnum.HeatMap,
  // enums.ChartTypeEnum.Line,
  // enums.ChartTypeEnum.NumberCard,
  // enums.ChartTypeEnum.Pie,
  // enums.ChartTypeEnum.PieAdvanced,
  // enums.ChartTypeEnum.PieGrid,
  // enums.ChartTypeEnum.TreeMap
];

export const Y_FIELDS_CHART_TYPE_VALUES = [
  enums.ChartTypeEnum.ELine,
  enums.ChartTypeEnum.EBar,
  enums.ChartTypeEnum.EScatter
];

export const JOIN_TYPE_VALUES = [
  enums.JoinTypeEnum.Cross,
  enums.JoinTypeEnum.Full,
  enums.JoinTypeEnum.FullOuter,
  enums.JoinTypeEnum.Inner,
  enums.JoinTypeEnum.Left,
  enums.JoinTypeEnum.LeftOuter,
  enums.JoinTypeEnum.Right,
  enums.JoinTypeEnum.RightOuter
];

export const JOIN_RELATIONSHIP_VALUES = [
  enums.JoinRelationshipEnum.OneToMany,
  enums.JoinRelationshipEnum.OneToOne,
  enums.JoinRelationshipEnum.ManyToOne,
  enums.JoinRelationshipEnum.ManyToMany
];

export const PROJECT_WEEK_START_VALUES = [
  enums.ProjectWeekStartEnum.Sunday,
  enums.ProjectWeekStartEnum.Monday
];

export const TIME_SOURCE_VALUES = [
  enums.TimeSourceEnum.Timestamp,
  enums.TimeSourceEnum.Epoch,
  enums.TimeSourceEnum.YYYYMMDD
];

export const TIMEFRAME_VALUES = [
  enums.TimeframeEnum.Date,
  enums.TimeframeEnum.DateTs,
  enums.TimeframeEnum.DayOfWeek,
  enums.TimeframeEnum.DayOfWeekIndex,
  enums.TimeframeEnum.DayOfMonth,
  enums.TimeframeEnum.DayOfYear,
  enums.TimeframeEnum.Week,
  enums.TimeframeEnum.WeekTs,
  enums.TimeframeEnum.WeekOfYear,
  enums.TimeframeEnum.Month,
  enums.TimeframeEnum.MonthTs,
  enums.TimeframeEnum.MonthName,
  enums.TimeframeEnum.MonthNum,
  enums.TimeframeEnum.Quarter,
  enums.TimeframeEnum.QuarterTs,
  enums.TimeframeEnum.QuarterOfYear,
  enums.TimeframeEnum.Year,
  enums.TimeframeEnum.YearTs,
  enums.TimeframeEnum.TimeOfDay,
  enums.TimeframeEnum.Time,
  enums.TimeframeEnum.Ts,
  enums.TimeframeEnum.Hour,
  enums.TimeframeEnum.HourTs,
  enums.TimeframeEnum.HourOfDay,
  enums.TimeframeEnum.Hour2,
  enums.TimeframeEnum.Hour3,
  enums.TimeframeEnum.Hour4,
  enums.TimeframeEnum.Hour6,
  enums.TimeframeEnum.Hour8,
  enums.TimeframeEnum.Hour12,
  enums.TimeframeEnum.Minute,
  enums.TimeframeEnum.MinuteTs,
  enums.TimeframeEnum.Minute2,
  enums.TimeframeEnum.Minute3,
  enums.TimeframeEnum.Minute5,
  enums.TimeframeEnum.Minute10,
  enums.TimeframeEnum.Minute15,
  enums.TimeframeEnum.Minute30,
  enums.TimeframeEnum.YesNoHasValue
];

export const CHART_COLOR_SCHEME_VALUES = [
  enums.ChartColorSchemeEnum.Soft,
  enums.ChartColorSchemeEnum.Air,
  enums.ChartColorSchemeEnum.Aqua,
  enums.ChartColorSchemeEnum.Cool,
  enums.ChartColorSchemeEnum.Fire,
  enums.ChartColorSchemeEnum.Flame,
  enums.ChartColorSchemeEnum.Forest,
  enums.ChartColorSchemeEnum.Horizon,
  enums.ChartColorSchemeEnum.Natural,
  enums.ChartColorSchemeEnum.Neons,
  enums.ChartColorSchemeEnum.Night,
  enums.ChartColorSchemeEnum.NightLights,
  enums.ChartColorSchemeEnum.Ocean,
  enums.ChartColorSchemeEnum.Picnic,
  enums.ChartColorSchemeEnum.Solar,
  enums.ChartColorSchemeEnum.Vivid
];

export const CHART_SCHEME_TYPE_VALUES = [
  enums.ChartSchemeTypeEnum.Linear,
  enums.ChartSchemeTypeEnum.Ordinal
];

export const CHART_INTERPOLATION_VALUES = [
  enums.ChartInterpolationEnum.Basis,
  enums.ChartInterpolationEnum.BasisClosed,
  enums.ChartInterpolationEnum.Bundle,
  enums.ChartInterpolationEnum.Cardinal,
  enums.ChartInterpolationEnum.CardinalClosed,
  enums.ChartInterpolationEnum.CatmullRomClosed,
  enums.ChartInterpolationEnum.CatmullRom,
  enums.ChartInterpolationEnum.Linear,
  enums.ChartInterpolationEnum.LinearClosed,
  enums.ChartInterpolationEnum.MonotoneX,
  enums.ChartInterpolationEnum.MonotoneY,
  enums.ChartInterpolationEnum.Natural,
  enums.ChartInterpolationEnum.Step,
  enums.ChartInterpolationEnum.StepAfter,
  enums.ChartInterpolationEnum.StepBefore
];

export const ROW_TYPE_VALUES = [
  enums.RowTypeEnum.Empty,
  enums.RowTypeEnum.Header,
  enums.RowTypeEnum.Global,
  enums.RowTypeEnum.Metric,
  enums.RowTypeEnum.Formula
];

export const SAFE_AGGREGATION_MEASURE_TYPES = [
  enums.FieldTypeEnum.CountDistinct,
  enums.FieldTypeEnum.Min,
  enums.FieldTypeEnum.Max,
  // enums.FieldTypeEnum.List,
  enums.FieldTypeEnum.SumByKey,
  enums.FieldTypeEnum.AverageByKey,
  enums.FieldTypeEnum.PercentileByKey,
  enums.FieldTypeEnum.MedianByKey
];
