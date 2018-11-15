// COMMON

export const TS_TO_BIGINT_DATATYPE = 'bigint';
export const ENUM_TO_VARCHAR_DATATYPE = 'varchar';

// ID

export const DASHBOARD_ID_DATATYPE = 'varchar'; // name
export const ERROR_ID_DATATYPE = 'varchar';
export const MCONFIG_ID_DATATYPE = 'varchar';
export const MEMBER_ID_DATATYPE = 'varchar'; // email
export const MODEL_ID_DATATYPE = 'varchar'; // name
export const PDT_ID_DATATYPE = 'varchar';
export const PROJECT_ID_DATATYPE = 'varchar'; // name
export const QUERY_ID_DATATYPE = 'varchar';
export const REPO_ID_DATATYPE = 'varchar'; // email
export const SESSION_ID_DATATYPE = 'varchar';
export const CHUNK_ID_DATATYPE = 'varchar';
export const MESSAGE_ID_DATATYPE = 'varchar';
export const USER_ID_DATATYPE = 'varchar'; // email
export const FILE_ABSOLUTE_ID_DATATYPE = 'varchar'; // full unique path
export const FILE_ID_DATATYPE = 'varchar'; // not full path, with underscores
export const USER_TRACK_ID_DATATYPE = 'varchar';
export const STRUCT_ID_DATATYPE = 'varchar';

// CHUNK

export const CHUNK_CONTENT = 'mediumtext';

// MESSAGE

export const MESSAGE_CONTENT = 'mediumtext';

// DASHBOARD

export const DASHBOARD_ACCESS_USERS_DATATYPE = 'text';
export const DASHBOARD_TITLE_DATATYPE = 'varchar';
export const DASHBOARD_GR_DATATYPE = 'varchar';
export const DASHBOARD_FIELDS_DATATYPE = 'mediumtext';
export const DASHBOARD_REPORTS_DATATYPE = 'text'; // references to mconfigs and queries
export const DASHBOARD_DESCRIPTION_DATATYPE = 'text';
export const DASHBOARD_CONTENT_DATATYPE = 'mediumtext';

// ERROR

export const ERROR_TYPE_DATATYPE = 'varchar';
export const ERROR_MESSAGE_DATATYPE = 'text';
export const ERROR_LINES_DATATYPE = 'text';

// FILE

export const FILE_PATH_DATATYPE = 'varchar';
export const FILE_NAME_DATATYPE = 'varchar';
export const FILE_CONTENT_DATATYPE = 'mediumtext';

// MCONFIG

export const MCONFIG_SELECT_DATATYPE = 'text';
export const MCONFIG_SORTINGS_DATATYPE = 'text';
export const MCONFIG_SORTS_DATATYPE = 'text';
export const MCONFIG_TIMEZONE_DATATYPE = 'varchar';
export const MCONFIG_LIMIT_DATATYPE = 'int';
export const MCONFIG_FILTERS_DATATYPE = 'text';
export const MCONFIG_CHARTS_DATATYPE = 'text';

// MEMBER

export const MEMBER_ALIAS_DATATYPE = 'varchar';
export const MEMBER_FIRST_NAME_DATATYPE = 'varchar';
export const MEMBER_LAST_NAME_DATATYPE = 'varchar';
export const MEMBER_PICTURE_URL_SMALL_DATATYPE = 'varchar';
export const MEMBER_PICTURE_URL_BIG_DATATYPE = 'varchar';

// MODEL

export const MODEL_CONTENT_DATATYPE = 'mediumtext';
export const MODEL_ACCESS_USERS_DATATYPE = 'text';
export const MODEL_LABEL_DATATYPE = 'varchar';
export const MODEL_GR_DATATYPE = 'varchar';
export const MODEL_FIELDS_DATATYPE = 'text';
export const MODEL_NODES_DATATYPE = 'text';
export const MODEL_DESCRIPTION_DATATYPE = 'text';

// PROJECT

export const PROJECT_BIGQUERY_PROJECT_DATATYPE = 'varchar';
export const PROJECT_BIGQUERY_CLIENT_EMAIL_DATATYPE = 'varchar';
export const PROJECT_QUERY_SIZE_LIMIT_DATATYPE = 'int';
export const PROJECT_TIMEZONE_DATATYPE = 'varchar';
export const PROJECT_ANALYTICS_PLAN_ID_DATATYPE = 'bigint';
export const PROJECT_ANALYTICS_MAX_PLAN_ID_DATATYPE = 'bigint';
export const PROJECT_ANALYTICS_SUBSCRIPTION_ID_DATATYPE = 'bigint';
export const PROJECT_BIGQUERY_CREDENTIALS_DATATYPE = 'text';
export const PROJECT_BIGQUERY_CREDENTIALS_FILE_PATH_DATATYPE = 'varchar';

// QUERY

export const QUERY_PDT_DEPS_DATATYPE = 'text';
export const QUERY_PDT_DEPS_ALL_DATATYPE = 'text';
export const QUERY_SQL_DATATYPE = 'mediumtext';
export const QUERY_LAST_RUN_BY_DATATYPE = 'varchar';
export const QUERY_LAST_COMPLETE_DURATION_DATATYPE = 'bigint';
export const QUERY_LAST_ERROR_MESSAGE_DATATYPE = 'mediumtext';
export const QUERY_DATA_DATATYPE = 'mediumtext';
export const QUERY_BIGQUERY_QUERY_JOB_ID_DATATYPE = 'varchar';
export const QUERY_BIGQUERY_COPY_JOB_ID_DATATYPE = 'varchar';

// REPO

export const REPO_UDFS_CONTENT_DATATYPE = 'text';
export const REPO_PDTS_SORTED_DATATYPE = 'text';
export const REPO_NODES_DATATYPE = 'mediumtext';
export const REPO_CONFLICTS_DATATYPE = 'text';
export const REPO_REMOTE_URL_DATATYPE = 'varchar';
export const REPO_REMOTE_WEBHOOK_DATATYPE = 'varchar';
export const REPO_REMOTE_PUBLIC_KEY_DATATYPE = 'varchar';
export const REPO_PUSH_ERROR_MESSAGE_DATATYPE = 'text';
export const REPO_PULL_ERROR_MESSAGE_DATATYPE = 'text';

// SESSION

// USER

export const USER_ALIAS_DATATYPE = 'varchar';
export const USER_FIRST_NAME_DATATYPE = 'varchar';
export const USER_LAST_NAME_DATATYPE = 'varchar';
export const USER_PICTURE_URL_SMALL_DATATYPE = 'varchar';
export const USER_PICTURE_URL_BIG_DATATYPE = 'varchar';
export const USER_TIMEZONE_DATATYPE = 'varchar';
