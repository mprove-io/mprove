import type { OptionsStoreGoogleApi } from '#common/types/backend/parts/connection-parts/options-store-google-api';
import type { ProjectWeekStart } from '#common/types/backend/parts/project/project-week-start';
import type { ChartType } from '#common/types/blockml/parts/chart/chart-type';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';
import type { FieldType } from '#common/types/blockml/parts/field/field-type';

export const MPROVE_CONFIG_FILENAME = 'mprove.yml';
export const MPROVE_EXPLORER_FILENAME = 'mprove-explorer.md';
export const MPROVE_CONFIG_NAME = 'mprove';

export const MPROVE_CONFIG_DIR_DOT_SLASH = './';

export const UTC = 'UTC';

export const MALLOY_FILTER_ANY = 'f``';

export const EXPLORER_CONTEXT_USAGE_WARNING_PERCENTAGE = 75;
export const EXPLORER_CONTEXT_USAGE_BUFFER = 20_000;
export const EMPTY_ASSISTANT_RESPONSE_MESSAGE =
  'The selected model returned no response. It may not support tool calling. Try a different model.';

export const PROJECT_CONFIG_ALLOW_TIMEZONES = 'true';
export const PROJECT_CONFIG_CASE_SENSITIVE_STRING_FILTERS = 'false';
export const PROJECT_CONFIG_DEFAULT_TIMEZONE = UTC;
export const PROJECT_CONFIG_WEEK_START: ProjectWeekStart = 'Sunday';
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

export const MY_SPACE_ID = '__my__';
export const UNCATEGORIZED_SPACE_ID = '__uncategorized__';
export const PERSONAL_SPACE_ID = '__personal__';
export const SHARED_SPACE_ID = '__shared__';

export const MY_SPACE_TITLE = 'My';
export const MY_REPORTS_SPACE_TITLE = 'My Reports';
export const MY_DASHBOARDS_SPACE_TITLE = 'My Dashboards';
export const MY_CHARTS_SPACE_TITLE = 'My Charts';
export const UNCATEGORIZED_SPACE_TITLE = 'Uncategorized';
export const PERSONAL_SPACE_TITLE = 'Personal';
export const SHARED_SPACE_TITLE = 'Shared';

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

export const PATH_BUILDER = 'builder';
export const PATH_EXPLORER = 'explorer';
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
export const PATH_SESSION = 'session';
export const PATH_NEW_SESSION = 'new-session';
export const PATH_SELECT_FILE = 'select-file';

export const PARAMETER_SESSION_ID = 'sessionId';

export const PATH_ORG = 'org';
export const PATH_ACCOUNT = 'account';
export const PATH_USERS = 'users';
export const PATH_SERVER_USERS = 'server-users';

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

export const PATH_PROJECT = 'project';
export const PATH_REPO = 'repo';
export const PATH_BRANCH = 'branch';
export const PATH_ENV = 'env';

export const PATH_INFO = 'info';
export const PATH_CONNECTIONS = 'connections';
export const PATH_PROVIDERS = 'providers';
export const PATH_ENVIRONMENTS = 'environments';
export const PATH_GIVENS = 'givens';
export const PATH_ROLES = 'roles';
export const PATH_TEAM = 'team';
export const PATH_SANDBOX_PROVIDER = 'sandbox-provider';

export const METHOD_RPC = 'RPC';

export const NO_FIELDS_SELECTED = 'no_fields_selected';

export const FIELD_RESULT_VALUES: FieldResult[] = [
  'string',
  'number',
  'day_of_week',
  'day_of_week_index',
  'month_name',
  'quarter_of_year',
  'ts',
  'yesno'
];

export const DIMENSION_TYPE_VALUES: FieldType[] = ['custom', 'yesno_is_true'];

export const MEASURE_TYPE_VALUES: FieldType[] = [
  'count_distinct',
  'sum',
  'sum_by_key',
  'average',
  'average_by_key',
  'median_by_key',
  'percentile_by_key',
  'min',
  'max',
  'list',
  'custom'
];

export const DIMENSION_RESULT_VALUES: FieldResult[] = ['string', 'number'];

export const MEASURE_RESULT_VALUES: FieldResult[] = ['string', 'number'];

export const CALCULATION_RESULT_VALUES: FieldResult[] = ['string', 'number'];

export const FILTER_RESULT_VALUES: FieldResult[] = [
  'string',
  'number',
  'day_of_week',
  'day_of_week_index',
  'month_name',
  'quarter_of_year',
  'ts',
  'yesno'
];

export const Y_FIELDS_CHART_TYPE_VALUES: ChartType[] = [
  'line',
  'bar',
  'scatter'
];

export const RELOAD_SESSION_EVENT_TYPE = 'session.mprove-reload-session';
export const SESSION_TITLE_UPDATED_EVENT_TYPE = 'session.mprove-title-updated';

export const SESSION_TAB_CREATED_EVENT_TYPE = 'session.tab.created';
