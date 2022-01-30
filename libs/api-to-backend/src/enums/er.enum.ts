export enum ErEnum {
  // BACKEND

  BACKEND_WRONG_ENV_VALUES = 'BACKEND_WRONG_ENV_VALUES',

  BACKEND_ORG_ID_FIRST_LETTER_DOES_NOT_MATCH_ANY_GROUP = 'BACKEND_ORG_ID_FIRST_LETTER_DOES_NOT_MATCH_ANY_GROUP',
  BACKEND_PROJECT_ID_FIRST_LETTER_DOES_NOT_MATCH_ANY_GROUP = 'BACKEND_PROJECT_ID_FIRST_LETTER_DOES_NOT_MATCH_ANY_GROUP',

  BACKEND_USER_ALIAS_IS_UNDEFINED = 'BACKEND_USER_ALIAS_IS_UNDEFINED',

  BACKEND_WRONG_REQUEST_PARAMS = 'BACKEND_WRONG_REQUEST_PARAMS',

  BACKEND_ERROR_CODE_FROM_BACKEND = 'BACKEND_ERROR_CODE_FROM_BACKEND',

  BACKEND_ERROR_RESPONSE_FROM_DISK = 'BACKEND_ERROR_RESPONSE_FROM_DISK',
  BACKEND_ERROR_RESPONSE_FROM_BLOCKML = 'BACKEND_ERROR_RESPONSE_FROM_BLOCKML',
  BACKEND_ERROR_RESPONSE_FROM_BACKEND = 'BACKEND_ERROR_RESPONSE_FROM_BACKEND',

  BACKEND_USER_ALREADY_REGISTERED = 'BACKEND_USER_ALREADY_REGISTERED',
  BACKEND_USER_IS_NOT_INVITED = 'BACKEND_USER_IS_NOT_INVITED',

  BACKEND_USER_DOES_NOT_EXIST = 'BACKEND_USER_DOES_NOT_EXIST',

  BACKEND_USER_IS_ORG_OWNER = 'BACKEND_USER_IS_ORG_OWNER',
  BACKEND_USER_IS_THE_ONLY_PROJECT_ADMIN = 'BACKEND_USER_IS_THE_ONLY_PROJECT_ADMIN',

  BACKEND_REGISTER_TO_SET_PASSWORD = 'BACKEND_REGISTER_TO_SET_PASSWORD',
  BACKEND_WRONG_PASSWORD = 'BACKEND_WRONG_PASSWORD',

  BACKEND_UNAUTHORIZED = 'BACKEND_UNAUTHORIZED',
  BACKEND_WRONG_SPECIAL_KEY = 'BACKEND_WRONG_SPECIAL_KEY',

  BACKEND_UPDATE_PASSWORD_WRONG_TOKEN = 'BACKEND_UPDATE_PASSWORD_WRONG_TOKEN',
  BACKEND_UPDATE_PASSWORD_TOKEN_EXPIRED = 'BACKEND_UPDATE_PASSWORD_TOKEN_EXPIRED',

  BACKEND_TEST_ROUTES_FORBIDDEN = 'BACKEND_TEST_ROUTES_FORBIDDEN',

  BACKEND_ORG_ALREADY_EXISTS = 'BACKEND_ORG_ALREADY_EXISTS',
  BACKEND_ORG_DOES_NOT_EXIST = 'BACKEND_ORG_DOES_NOT_EXIST',
  BACKEND_FORBIDDEN_ORG = 'BACKEND_FORBIDDEN_ORG',
  BACKEND_ONLY_ORG_OWNER_CAN_ACCESS = 'BACKEND_ONLY_ORG_OWNER_CAN_ACCESS',
  BACKEND_NEW_OWNER_NOT_FOUND = 'BACKEND_NEW_OWNER_NOT_FOUND',

  BACKEND_PROJECT_ALREADY_EXISTS = 'BACKEND_PROJECT_ALREADY_EXISTS',
  BACKEND_PROJECT_DOES_NOT_EXIST = 'BACKEND_PROJECT_DOES_NOT_EXIST',
  BACKEND_FORBIDDEN_PROJECT = 'BACKEND_FORBIDDEN_PROJECT',
  BACKEND_RESTRICTED_PROJECT = 'BACKEND_RESTRICTED_PROJECT',

  BACKEND_MEMBER_IS_NOT_ADMIN = 'BACKEND_MEMBER_IS_NOT_ADMIN',
  BACKEND_MEMBER_IS_NOT_EDITOR = 'BACKEND_MEMBER_IS_NOT_EDITOR',
  BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN = 'BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN',
  BACKEND_MEMBER_ALREADY_EXISTS = 'BACKEND_MEMBER_ALREADY_EXISTS',
  BACKEND_MEMBER_DOES_NOT_EXIST = 'BACKEND_MEMBER_DOES_NOT_EXIST',
  BACKEND_ADMIN_CAN_NOT_DELETE_HIMSELF = 'BACKEND_ADMIN_CAN_NOT_DELETE_HIMSELF',
  BACKEND_ADMIN_CAN_NOT_CHANGE_HIS_ADMIN_STATUS = 'BACKEND_ADMIN_CAN_NOT_CHANGE_HIS_ADMIN_STATUS',

  BACKEND_CONNECTION_ALREADY_EXISTS = 'BACKEND_CONNECTION_ALREADY_EXISTS',
  BACKEND_CONNECTION_DOES_NOT_EXIST = 'BACKEND_CONNECTION_DOES_NOT_EXIST',

  BACKEND_FORBIDDEN_REPO = 'BACKEND_FORBIDDEN_REPO',

  BACKEND_BRANCH_ALREADY_EXISTS = 'BACKEND_BRANCH_ALREADY_EXISTS',
  BACKEND_BRANCH_DOES_NOT_EXIST = 'BACKEND_BRANCH_DOES_NOT_EXIST',
  BACKEND_BRANCH_MASTER_CAN_NOT_BE_DELETED = 'BACKEND_BRANCH_MASTER_CAN_NOT_BE_DELETED',

  BACKEND_MODEL_DOES_NOT_EXIST = 'BACKEND_MODEL_DOES_NOT_EXIST',
  BACKEND_FORBIDDEN_MODEL = 'BACKEND_FORBIDDEN_MODEL',

  BACKEND_DASHBOARD_DOES_NOT_EXIST = 'BACKEND_DASHBOARD_DOES_NOT_EXIST',
  BACKEND_FORBIDDEN_DASHBOARD = 'BACKEND_FORBIDDEN_DASHBOARD',
  BACKEND_FORBIDDEN_DASHBOARD_PATH = 'BACKEND_FORBIDDEN_DASHBOARD_PATH',

  BACKEND_VIZ_DOES_NOT_EXIST = 'BACKEND_VIZ_DOES_NOT_EXIST',
  BACKEND_FORBIDDEN_VIZ = 'BACKEND_FORBIDDEN_VIZ',
  BACKEND_FORBIDDEN_VIZ_PATH = 'BACKEND_FORBIDDEN_VIZ_PATH',

  BACKEND_MCONFIG_DOES_NOT_EXIST = 'BACKEND_MCONFIG_DOES_NOT_EXIST',

  BACKEND_STRUCT_DOES_NOT_EXIST = 'BACKEND_STRUCT_DOES_NOT_EXIST',

  BACKEND_QUERY_DOES_NOT_EXIST = 'BACKEND_QUERY_DOES_NOT_EXIST',

  BACKEND_MCONFIG_QUERY_ID_MISMATCH = 'BACKEND_MCONFIG_QUERY_ID_MISMATCH',

  BACKEND_OLD_MCONFIG_MISMATCH = 'BACKEND_OLD_MCONFIG_MISMATCH',

  BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERIES = 'BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERIES',
  BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERY = 'BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERY',
  BACKEND_SCHEDULER_REMOVE_ORPHANED_STRUCTS = 'BACKEND_SCHEDULER_REMOVE_ORPHANED_STRUCTS',
  BACKEND_SCHEDULER_REMOVE_ORPHANED_QUERIES = 'BACKEND_SCHEDULER_REMOVE_ORPHANED_QUERIES',
  BACKEND_SCHEDULER_REMOVE_IDEMPS = 'BACKEND_SCHEDULER_REMOVE_IDEMPS',

  BACKEND_MORE_THAN_ONE_PROJECT_ID = 'BACKEND_MORE_THAN_ONE_PROJECT_ID',

  BACKEND_BIGQUERY_CANCEL_QUERY_JOB_FAIL = 'BACKEND_BIGQUERY_CANCEL_QUERY_JOB_FAIL',

  BACKEND_AVATAR_DOES_NOT_EXIST = 'BACKEND_AVATAR_DOES_NOT_EXIST',

  BACKEND_TRANSACTION_RETRY = 'BACKEND_TRANSACTION_RETRY',
  BACKEND_GET_IDEMP_RESP_RETRY = 'BACKEND_GET_IDEMP_RESP_RETRY',
  BACKEND_GET_IDEMP_RESP_RETRY_FAILED = 'BACKEND_GET_IDEMP_RESP_RETRY_FAILED',

  BACKEND_APP_FILTER_SAVE_IDEMP_ERROR = 'BACKEND_APP_FILTER_SAVE_IDEMP_ERROR',
  BACKEND_APP_FILTER_ERROR = 'BACKEND_APP_FILTER_ERROR',

  BACKEND_CHECK_BLOCKML_ERRORS = 'BACKEND_CHECK_BLOCKML_ERRORS'
}
