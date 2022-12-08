export enum ErEnum {
  // BACKEND

  BACKEND_APP_TERMINATED = 'BACKEND_APP_TERMINATED',
  BACKEND_UNCAUGHT_EXCEPTION = 'BACKEND_UNCAUGHT_EXCEPTION',
  BACKEND_UNHANDLED_REJECTION_REASON = 'BACKEND_UNHANDLED_REJECTION_REASON',
  BACKEND_UNHANDLED_REJECTION_ERROR = 'BACKEND_UNHANDLED_REJECTION_ERROR',

  BACKEND_WRONG_ENV_VALUES = 'BACKEND_WRONG_ENV_VALUES',

  BACKEND_ORG_ID_FIRST_LETTER_DOES_NOT_MATCH_ANY_GROUP = 'BACKEND_ORG_ID_FIRST_LETTER_DOES_NOT_MATCH_ANY_GROUP',
  BACKEND_PROJECT_ID_FIRST_LETTER_DOES_NOT_MATCH_ANY_GROUP = 'BACKEND_PROJECT_ID_FIRST_LETTER_DOES_NOT_MATCH_ANY_GROUP',

  BACKEND_USER_ALIAS_IS_UNDEFINED = 'BACKEND_USER_ALIAS_IS_UNDEFINED',

  BACKEND_WRONG_REQUEST_INFO_NAME = 'BACKEND_WRONG_REQUEST_INFO_NAME',
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
  BACKEND_NOT_AUTHORIZED = 'BACKEND_NOT_AUTHORIZED',
  BACKEND_WRONG_SPECIAL_KEY = 'BACKEND_WRONG_SPECIAL_KEY',

  BACKEND_UPDATE_PASSWORD_WRONG_TOKEN = 'BACKEND_UPDATE_PASSWORD_WRONG_TOKEN',
  BACKEND_UPDATE_PASSWORD_TOKEN_EXPIRED = 'BACKEND_UPDATE_PASSWORD_TOKEN_EXPIRED',

  BACKEND_TEST_ROUTES_FORBIDDEN = 'BACKEND_TEST_ROUTES_FORBIDDEN',

  BACKEND_ORG_ALREADY_EXISTS = 'BACKEND_ORG_ALREADY_EXISTS',
  BACKEND_ORG_DOES_NOT_EXIST = 'BACKEND_ORG_DOES_NOT_EXIST',
  BACKEND_FORBIDDEN_ORG = 'BACKEND_FORBIDDEN_ORG',
  BACKEND_ONLY_ORG_OWNER_CAN_ACCESS = 'BACKEND_ONLY_ORG_OWNER_CAN_ACCESS',
  BACKEND_NEW_OWNER_NOT_FOUND = 'BACKEND_NEW_OWNER_NOT_FOUND',
  BACKEND_CREATION_OF_ORGANIZATIONS_IS_FORBIDDEN = 'BACKEND_CREATION_OF_ORGANIZATIONS_IS_FORBIDDEN',

  BACKEND_NOTE_DOES_NOT_EXIST = 'BACKEND_NOTE_DOES_NOT_EXIST',

  BACKEND_PROJECT_ALREADY_EXISTS = 'BACKEND_PROJECT_ALREADY_EXISTS',
  BACKEND_PROJECT_DOES_NOT_EXIST = 'BACKEND_PROJECT_DOES_NOT_EXIST',
  BACKEND_FORBIDDEN_PROJECT = 'BACKEND_FORBIDDEN_PROJECT',
  BACKEND_RESTRICTED_ORGANIZATION_NAME = 'BACKEND_RESTRICTED_ORGANIZATION_NAME',
  BACKEND_RESTRICTED_ORGANIZATION = 'BACKEND_RESTRICTED_ORGANIZATION',
  BACKEND_RESTRICTED_PROJECT = 'BACKEND_RESTRICTED_PROJECT',
  BACKEND_RESTRICTED_USER = 'BACKEND_RESTRICTED_USER',

  BACKEND_MEMBER_IS_NOT_EXPLORER = 'BACKEND_MEMBER_IS_NOT_EXPLORER',
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

  BACKEND_MANUAL_COMMIT_TO_PRODUCTION_REPO_IS_FORBIDDEN = 'BACKEND_MANUAL_COMMIT_TO_PRODUCTION_REPO_IS_FORBIDDEN',

  BACKEND_BRANCH_ALREADY_EXISTS = 'BACKEND_BRANCH_ALREADY_EXISTS',
  BACKEND_BRANCH_DOES_NOT_EXIST = 'BACKEND_BRANCH_DOES_NOT_EXIST',
  BACKEND_DEFAULT_BRANCH_CAN_NOT_BE_DELETED = 'BACKEND_DEFAULT_BRANCH_CAN_NOT_BE_DELETED',

  BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST = 'BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST',

  BACKEND_ENV_ALREADY_EXISTS = 'BACKEND_ENV_ALREADY_EXISTS',
  BACKEND_ENV_DOES_NOT_EXIST = 'BACKEND_ENV_DOES_NOT_EXIST',
  BACKEND_MEMBER_DOES_NOT_HAVE_ACCESS_TO_ENV = 'BACKEND_MEMBER_DOES_NOT_HAVE_ACCESS_TO_ENV',
  BACKEND_ENV_PROD_CAN_NOT_BE_DELETED = 'BACKEND_ENV_PROD_CAN_NOT_BE_DELETED',

  BACKEND_EV_ALREADY_EXISTS = 'BACKEND_EV_ALREADY_EXISTS',
  BACKEND_EV_DOES_NOT_EXIST = 'BACKEND_EV_DOES_NOT_EXIST',

  BACKEND_MODEL_DOES_NOT_EXIST = 'BACKEND_MODEL_DOES_NOT_EXIST',
  BACKEND_FORBIDDEN_MODEL = 'BACKEND_FORBIDDEN_MODEL',

  BACKEND_DASHBOARD_DOES_NOT_EXIST = 'BACKEND_DASHBOARD_DOES_NOT_EXIST',
  BACKEND_FORBIDDEN_DASHBOARD = 'BACKEND_FORBIDDEN_DASHBOARD',
  BACKEND_REPORT_MCONFIG_ID_MISMATCH = 'BACKEND_REPORT_MCONFIG_ID_MISMATCH',
  BACKEND_FORBIDDEN_DASHBOARD_PATH = 'BACKEND_FORBIDDEN_DASHBOARD_PATH',

  BACKEND_VIS_DOES_NOT_EXIST = 'BACKEND_VIS_DOES_NOT_EXIST',
  BACKEND_FORBIDDEN_VIS = 'BACKEND_FORBIDDEN_VIS',
  BACKEND_FORBIDDEN_VIS_PATH = 'BACKEND_FORBIDDEN_VIS_PATH',

  BACKEND_MCONFIG_DOES_NOT_EXIST = 'BACKEND_MCONFIG_DOES_NOT_EXIST',

  BACKEND_STRUCT_DOES_NOT_EXIST = 'BACKEND_STRUCT_DOES_NOT_EXIST',

  BACKEND_STRUCT_ID_CHANGED = 'BACKEND_STRUCT_ID_CHANGED',

  BACKEND_QUERY_DOES_NOT_EXIST = 'BACKEND_QUERY_DOES_NOT_EXIST',

  BACKEND_QUERIES_DO_NOT_EXIST = 'BACKEND_QUERIES_DO_NOT_EXIST',

  BACKEND_MCONFIG_QUERY_ID_MISMATCH = 'BACKEND_MCONFIG_QUERY_ID_MISMATCH',

  BACKEND_OLD_MCONFIG_MISMATCH = 'BACKEND_OLD_MCONFIG_MISMATCH',

  BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERIES = 'BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERIES',
  BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERY = 'BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERY',
  BACKEND_SCHEDULER_REMOVE_ORPHANED_STRUCTS = 'BACKEND_SCHEDULER_REMOVE_ORPHANED_STRUCTS',
  BACKEND_SCHEDULER_REMOVE_ORPHANED_QUERIES = 'BACKEND_SCHEDULER_REMOVE_ORPHANED_QUERIES',
  BACKEND_SCHEDULER_REMOVE_IDEMPS = 'BACKEND_SCHEDULER_REMOVE_IDEMPS',

  BACKEND_BIGQUERY_CANCEL_QUERY_JOB_FAIL = 'BACKEND_BIGQUERY_CANCEL_QUERY_JOB_FAIL',

  BACKEND_AVATAR_DOES_NOT_EXIST = 'BACKEND_AVATAR_DOES_NOT_EXIST',

  BACKEND_TRANSACTION_RETRY = 'BACKEND_TRANSACTION_RETRY',
  BACKEND_GET_IDEMP_RESP_RETRY = 'BACKEND_GET_IDEMP_RESP_RETRY',
  BACKEND_GET_IDEMP_RESP_RETRY_FAILED = 'BACKEND_GET_IDEMP_RESP_RETRY_FAILED',

  BACKEND_APP_FILTER_SAVE_IDEMP_ERROR = 'BACKEND_APP_FILTER_SAVE_IDEMP_ERROR',
  BACKEND_APP_FILTER_ERROR = 'BACKEND_APP_FILTER_ERROR',

  BACKEND_CREATE_TEMP_DASHBOARD_FAIL = 'BACKEND_CREATE_TEMP_DASHBOARD_FAIL',

  BACKEND_CREATE_DASHBOARD_FAIL = 'BACKEND_CREATE_DASHBOARD_FAIL',
  BACKEND_MODIFY_DASHBOARD_FAIL = 'BACKEND_MODIFY_DASHBOARD_FAIL',

  BACKEND_CREATE_VIS_FAIL = 'BACKEND_CREATE_VIS_FAIL',
  BACKEND_MODIFY_VIS_FAIL = 'BACKEND_MODIFY_VIS_FAIL',

  BACKEND_SNOWFLAKE_FAILED_TO_CONNECT = 'BACKEND_SNOWFLAKE_FAILED_TO_CONNECT',
  BACKEND_SNOWFLAKE_FAILED_TO_DESTROY_CONNECTION = 'BACKEND_SNOWFLAKE_FAILED_TO_DESTROY_CONNECTION',

  // DISK

  DISK_APP_TERMINATED = 'DISK_APP_TERMINATED',
  DISK_UNCAUGHT_EXCEPTION = 'DISK_UNCAUGHT_EXCEPTION',
  DISK_UNHANDLED_REJECTION_REASON = 'DISK_UNHANDLED_REJECTION_REASON',
  DISK_UNHANDLED_REJECTION_ERROR = 'DISK_UNHANDLED_REJECTION_ERROR',

  DISK_WRONG_ENV_VALUES = 'DISK_WRONG_ENV_VALUES',

  DISK_WRONG_REQUEST_INFO_NAME = 'DISK_WRONG_REQUEST_INFO_NAME',
  DISK_WRONG_REQUEST_PARAMS = 'DISK_WRONG_REQUEST_PARAMS',

  DISK_ORG_ALREADY_EXIST = 'DISK_ORG_ALREADY_EXIST',
  DISK_ORG_IS_NOT_EXIST = 'DISK_ORG_IS_NOT_EXIST',

  DISK_FILE_SIZE_IS_TOO_BIG = 'DISK_FILE_SIZE_IS_TOO_BIG',

  DISK_PROJECT_ALREADY_EXIST = 'DISK_PROJECT_ALREADY_EXIST',
  DISK_PROJECT_IS_NOT_EXIST = 'DISK_PROJECT_IS_NOT_EXIST',

  DISK_REPO_ALREADY_EXIST = 'DISK_REPO_ALREADY_EXIST',
  DISK_REPO_IS_NOT_EXIST = 'DISK_REPO_IS_NOT_EXIST',

  DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH = 'DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH',
  DISK_REPO_STATUS_IS_NOT_NEED_PUSH = 'DISK_REPO_STATUS_IS_NOT_NEED_PUSH',

  DISK_DEV_REPO_COMMIT_DOES_NOT_MATCH_LOCAL_COMMIT = 'DISK_DEV_REPO_COMMIT_DOES_NOT_MATCH_LOCAL_COMMIT',

  DISK_BRANCH_ALREADY_EXIST = 'DISK_BRANCH_ALREADY_EXIST',
  DISK_BRANCH_IS_NOT_EXIST = 'DISK_BRANCH_IS_NOT_EXIST',
  DISK_THEIR_BRANCH_IS_NOT_EXIST = 'DISK_THEIR_BRANCH_IS_NOT_EXIST',
  DISK_DEFAULT_BRANCH_CAN_NOT_BE_DELETED = 'DISK_DEFAULT_BRANCH_CAN_NOT_BE_DELETED',

  DISK_NEW_PATH_ALREADY_EXIST = 'DISK_NEW_PATH_ALREADY_EXIST',
  DISK_TO_PATH_ALREADY_EXIST = 'DISK_TO_PATH_ALREADY_EXIST',

  DISK_PARENT_PATH_IS_NOT_EXIST = 'DISK_PARENT_PATH_IS_NOT_EXIST',
  DISK_FROM_PATH_IS_NOT_EXIST = 'DISK_FROM_PATH_IS_NOT_EXIST',
  DISK_OLD_PATH_IS_NOT_EXIST = 'DISK_OLD_PATH_IS_NOT_EXIST',

  DISK_FOLDER_ALREADY_EXIST = 'DISK_FOLDER_ALREADY_EXIST',
  DISK_FOLDER_IS_NOT_EXIST = 'DISK_FOLDER_IS_NOT_EXIST',

  DISK_FILE_ALREADY_EXIST = 'DISK_FILE_ALREADY_EXIST',
  DISK_FILE_IS_NOT_EXIST = 'DISK_FILE_IS_NOT_EXIST',

  // BLOCKML

  BLOCKML_APP_TERMINATED = 'BLOCKML_APP_TERMINATED',
  BLOCKML_UNCAUGHT_EXCEPTION = 'BLOCKML_UNCAUGHT_EXCEPTION',
  BLOCKML_UNHANDLED_REJECTION_REASON = 'BLOCKML_UNHANDLED_REJECTION_REASON',
  BLOCKML_UNHANDLED_REJECTION_ERROR = 'BLOCKML_UNHANDLED_REJECTION_ERROR',

  BLOCKML_WRONG_ENV_VALUES = 'BLOCKML_WRONG_ENV_VALUES',

  BLOCKML_WRONG_REQUEST_INFO_NAME = 'BLOCKML_WRONG_REQUEST_INFO_NAME',
  BLOCKML_WRONG_REQUEST_PARAMS = 'BLOCKML_WRONG_REQUEST_PARAMS',
  BLOCKML_WRONG_TEST_TRANSFORM_AND_VALIDATE = 'BLOCKML_WRONG_TEST_TRANSFORM_AND_VALIDATE',

  BLOCKML_GEN_SQL_OUTCOME_ERROR = 'BLOCKML_GEN_SQL_OUTCOME_ERROR',

  // BLOCKML_WORKER

  BLOCKML_WORKER_WRONG_REQUEST_INFO_NAME = 'BLOCKML_WORKER_WRONG_REQUEST_INFO_NAME',
  BLOCKML_WORKER_WRONG_REQUEST_PARAMS = 'BLOCKML_WORKER_WRONG_REQUEST_PARAMS',
  BLOCKML_WORKER_WRONG_TEST_TRANSFORM_AND_VALIDATE = 'BLOCKML_WORKER_WRONG_TEST_TRANSFORM_AND_VALIDATE',

  // MCLI

  MCLI_APP_TERMINATED = 'MCLI_APP_TERMINATED',
  MCLI_UNCAUGHT_EXCEPTION = 'MCLI_UNCAUGHT_EXCEPTION',
  MCLI_UNHANDLED_REJECTION_REASON = 'MCLI_UNHANDLED_REJECTION_REASON',
  MCLI_UNHANDLED_REJECTION_ERROR = 'MCLI_UNHANDLED_REJECTION_ERROR',

  MCLI_WRONG_ENV_VALUES = 'MCLI_WRONG_ENV_VALUES',

  MCLI_ERROR_RESPONSE_FROM_BACKEND = 'MCLI_ERROR_RESPONSE_FROM_BACKEND',

  MCLI_DASHBOARD_NOT_FOUND = 'MCLI_DASHBOARD_NOT_FOUND',
  MCLI_VISUALIZATION_NOT_FOUND = 'MCLI_VISUALIZATION_NOT_FOUND'
}
