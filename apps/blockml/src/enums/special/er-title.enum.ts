export enum ErTitleEnum {
  // yaml
  DUPLICATE_FILE_NAMES = 'DUPLICATE_FILE_NAMES',

  FILE_CONTENT_IS_NOT_YAML = 'FILE_CONTENT_IS_NOT_YAML',
  PROCESSED_CONTENT_IS_NOT_YAML = 'PROCESSED_CONTENT_IS_NOT_YAML',
  TOP_LEVEL_IS_NOT_DICTIONARY = 'TOP_LEVEL_IS_NOT_DICTIONARY',

  UNDEFINED_VALUE = 'UNDEFINED_VALUE',
  ARRAY_ELEMENT_IS_NULL = 'ARRAY_ELEMENT_IS_NULL',
  DUPLICATE_PARAMETERS = 'DUPLICATE_PARAMETERS',

  UNKNOWN_UDF_PARAMETER = 'UNKNOWN_UDF_PARAMETER',
  UNKNOWN_VIEW_PARAMETER = 'UNKNOWN_VIEW_PARAMETER',
  UNKNOWN_MODEL_PARAMETER = 'UNKNOWN_MODEL_PARAMETER',
  UNKNOWN_DASHBOARD_PARAMETER = 'UNKNOWN_DASHBOARD_PARAMETER',
  UNKNOWN_VIZ_PARAMETER = 'UNKNOWN_VIZ_PARAMETER',
  UNKNOWN_MPROVE_CONFIG_PARAMETER = 'UNKNOWN_MPROVE_CONFIG_PARAMETER',
  UNEXPECTED_LIST = 'UNEXPECTED_LIST',
  UNEXPECTED_DICTIONARY = 'UNEXPECTED_DICTIONARY',
  PARAMETER_IS_NOT_A_LIST = 'PARAMETER_IS_NOT_A_LIST',

  WRONG_HIDDEN = 'WRONG_HIDDEN',
  WRONG_CHAR_IN_PARAMETER_VALUE = 'WRONG_CHAR_IN_PARAMETER_VALUE',

  MISSING_CONNECTION = 'MISSING_CONNECTION',
  CONNECTION_NOT_FOUND = 'CONNECTION_NOT_FOUND',

  UDFS_ARE_NOT_SUPPORTED_FOR_CONNECTION = 'UDFS_ARE_NOT_SUPPORTED_FOR_CONNECTION',

  WRONG_UDF_NAME = 'WRONG_UDF_NAME',
  WRONG_VIEW_NAME = 'WRONG_VIEW_NAME',
  WRONG_MODEL_NAME = 'WRONG_MODEL_NAME',
  WRONG_DASHBOARD_NAME = 'WRONG_DASHBOARD_NAME',
  WRONG_VIZ_NAME = 'WRONG_VIZ_NAME',

  MPROVE_CONFIG_NOT_FOUND = 'MPROVE_CONFIG_NOT_FOUND',

  MISSING_MPROVE_DIR = 'MISSING_MPROVE_DIR',
  MPROVE_DIR_FOLDER_NAME_HAS_A_DOT = 'MPROVE_DIR_FOLDER_NAME_HAS_A_DOT',
  MPROVE_DIR_PATH_DOES_NOT_EXIST = 'MPROVE_DIR_PATH_DOES_NOT_EXIST',

  WRONG_ALLOW_TIMEZONES = 'WRONG_ALLOW_TIMEZONES',
  WRONG_WEEK_START = 'WRONG_WEEK_START',
  WRONG_DEFAULT_TIMEZONE = 'WRONG_DEFAULT_TIMEZONE',

  // fields
  MISSING_FIELDS = 'MISSING_FIELDS',

  FIELD_IS_NOT_A_DICTIONARY = 'FIELD_IS_NOT_A_DICTIONARY',

  MISSING_FIELD_DECLARATION = 'MISSING_FIELD_DECLARATION',
  TOO_MANY_DECLARATIONS_FOR_ONE_FIELD = 'TOO_MANY_DECLARATIONS_FOR_ONE_FIELD',
  FIELD_DECLARATION_WRONG_VALUE = 'FIELD_DECLARATION_WRONG_VALUE',
  DASHBOARD_FIELD_MUST_BE_A_FILTER = 'DASHBOARD_FIELD_MUST_BE_A_FILTER',

  UNEXPECTED_SQL_IN_FILTER = 'UNEXPECTED_SQL_IN_FILTER',
  MISSING_SQL = 'MISSING_SQL',

  DUPLICATE_FIELD_NAMES = 'DUPLICATE_FIELD_NAMES',

  WRONG_FIELD_HIDDEN = 'WRONG_FIELD_HIDDEN',
  UNKNOWN_DIMENSION_PARAMETER = 'UNKNOWN_DIMENSION_PARAMETER',
  UNKNOWN_TIME_PARAMETER = 'UNKNOWN_TIME_PARAMETER',
  UNKNOWN_MEASURE_PARAMETER = 'UNKNOWN_MEASURE_PARAMETER',
  UNKNOWN_CALCULATION_PARAMETER = 'UNKNOWN_CALCULATION_PARAMETER',
  UNKNOWN_FILTER_PARAMETER = 'UNKNOWN_FILTER_PARAMETER',
  UNEXPECTED_LIST_IN_FIELD_PARAMETERS = 'UNEXPECTED_LIST_IN_FIELD_PARAMETERS',
  UNEXPECTED_DICTIONARY_IN_FIELD_PARAMETERS = 'UNEXPECTED_DICTIONARY_IN_FIELD_PARAMETERS',
  FIELD_PARAMETER_IS_NOT_A_LIST = 'FIELD_PARAMETER_IS_NOT_A_LIST',

  WRONG_DIMENSION_TYPE = 'WRONG_DIMENSION_TYPE',
  UNNEST_IS_NOT_SUPPORTED_FOR_CONNECTION = 'UNNEST_IS_NOT_SUPPORTED_FOR_CONNECTION',

  MISSING_TYPE_FOR_MEASURE = 'MISSING_TYPE_FOR_MEASURE',
  WRONG_MEASURE_TYPE = 'WRONG_MEASURE_TYPE',
  MISSING_SQL_KEY = 'MISSING_SQL_KEY',
  MEASURE_TYPE_IS_NOT_SUPPORTED_FOR_CONNECTION = 'MEASURE_TYPE_IS_NOT_SUPPORTED_FOR_CONNECTION',
  PERCENTILE_IS_NOT_SUPPORTED_FOR_CONNECTION = 'PERCENTILE_IS_NOT_SUPPORTED_FOR_CONNECTION',
  MISSING_PERCENTILE = 'MISSING_PERCENTILE',
  WRONG_PERCENTILE = 'WRONG_PERCENTILE',
  MEASURE_SQL_MISSING_BLOCKML_REFERENCE = 'MEASURE_SQL_MISSING_BLOCKML_REFERENCE',
  MEASURE_SQL_KEY_MISSING_BLOCKML_REFERENCE = 'MEASURE_SQL_KEY_MISSING_BLOCKML_REFERENCE',

  CALCULATION_SQL_MISSING_BLOCKML_REFERENCE = 'CALCULATION_SQL_MISSING_BLOCKML_REFERENCE',

  MISSING_FILTER_RESULT = 'MISSING_FILTER_RESULT',
  WRONG_DIMENSION_RESULT = 'WRONG_DIMENSION_RESULT',
  WRONG_MEASURE_RESULT = 'WRONG_MEASURE_RESULT',
  WRONG_CALCULATION_RESULT = 'WRONG_CALCULATION_RESULT',
  WRONG_FILTER_RESULT = 'WRONG_FILTER_RESULT',

  WRONG_FORMAT_NUMBER = 'WRONG_FORMAT_NUMBER',
  MISUSE_OF_FORMAT_NUMBER = 'MISUSE_OF_FORMAT_NUMBER',
  MISUSE_OF_CURRENCY_PREFIX = 'MISUSE_OF_CURRENCY_PREFIX',
  MISUSE_OF_CURRENCY_SUFFIX = 'MISUSE_OF_CURRENCY_SUFFIX',

  WRONG_TIME_SOURCE = 'WRONG_TIME_SOURCE',
  WRONG_TIMEFRAMES_ELEMENT = 'WRONG_TIMEFRAMES_ELEMENT',

  WRONG_CHARS_IN_ALIAS = 'WRONG_CHARS_IN_ALIAS',
  WRONG_CHARS_IN_VIEW_FIELDS_REFS = 'WRONG_CHARS_IN_VIEW_FIELDS_REFS',
  WRONG_CHARS_IN_MODEL_FIELDS_REFS = 'WRONG_CHARS_IN_MODEL_FIELDS_REFS',

  REFERENCE_TO_NOT_VALID_FIELD = 'REFERENCE_TO_NOT_VALID_FIELD',
  FIELD_SELF_REFERENCE = 'FIELD_SELF_REFERENCE',
  FIELD_REFS_FILTER = 'FIELD_REFS_FILTER',
  DIMENSION_REFS_MEASURE = 'DIMENSION_REFS_MEASURE',
  DIMENSION_REFS_CALCULATION = 'DIMENSION_REFS_CALCULATION',
  MEASURE_REFS_MEASURE = 'MEASURE_REFS_MEASURE',
  MEASURE_REFS_CALCULATION = 'MEASURE_REFS_CALCULATION',

  CYCLE_IN_REFERENCES = 'CYCLE_IN_REFERENCES',

  // udf

  // view
  MISSING_TABLE = 'MISSING_TABLE',

  TABLE_REFERENCES_MISSING_ENV_VAR = 'TABLE_REFERENCES_MISSING_ENV_VAR',
  DERIVED_TABLE_REFERENCES_MISSING_ENV_VAR = 'DERIVED_TABLE_REFERENCES_MISSING_ENV_VAR',

  WRONG_UDF = 'WRONG_UDF',

  APPLY_FILTER_REFS_MISSING_FILTER = 'APPLY_FILTER_REFS_MISSING_FILTER',
  APPLY_FILTER_MUST_REFERENCE_A_FILTER = 'APPLY_FILTER_MUST_REFERENCE_A_FILTER',

  DERIVED_TABLE_VIEW_SELF_REFERENCE = 'DERIVED_TABLE_VIEW_SELF_REFERENCE',
  DERIVED_TABLE_SAME_ALIAS_FOR_DIFFERENT_VIEWS = 'DERIVED_TABLE_SAME_ALIAS_FOR_DIFFERENT_VIEWS',
  DERIVED_TABLE_NO_VIEW_REFERENCE = 'DERIVED_TABLE_NO_VIEW_REFERENCE',

  DERIVED_TABLE_CYCLE_IN_VIEW_REFERENCES = 'DERIVED_TABLE_CYCLE_IN_VIEW_REFERENCES',

  DERIVED_TABLE_REFERENCES_MISSING_VIEW = 'DERIVED_TABLE_REFERENCES_MISSING_VIEW',
  DERIVED_TABLE_REFERENCED_VIEW_HAS_DIFFERENT_CONNECTION = 'DERIVED_TABLE_REFERENCED_VIEW_HAS_DIFFERENT_CONNECTION',
  DERIVED_TABLE_REFERENCED_VIEW_HAS_APPLY_FILTER = 'DERIVED_TABLE_REFERENCED_VIEW_HAS_APPLY_FILTER',
  DERIVED_TABLE_REFERENCES_MISSING_FIELD = 'DERIVED_TABLE_REFERENCES_MISSING_FIELD',
  DERIVED_TABLE_REFERENCES_FILTER = 'DERIVED_TABLE_REFERENCES_FILTER',

  // model
  WRONG_MODEL_UDF = 'WRONG_MODEL_UDF',

  MISSING_JOINS = 'MISSING_JOINS',

  FROM_VIEW_AND_JOIN_VIEW = 'FROM_VIEW_AND_JOIN_VIEW',
  MISSING_FROM_VIEW_OR_JOIN_VIEW = 'MISSING_FROM_VIEW_OR_JOIN_VIEW',
  MISSING_FROM_VIEW_ELEMENT = 'MISSING_FROM_VIEW_ELEMENT',
  TOO_MANY_FROM_VIEW = 'TOO_MANY_FROM_VIEW',

  MISSING_AS = 'MISSING_AS',
  DUPLICATE_ALIASES = 'DUPLICATE_ALIASES',

  JOIN_CALLS_MISSING_VIEW = 'JOIN_CALLS_MISSING_VIEW',
  JOIN_REFERENCED_VIEW_HAS_DIFFERENT_CONNECTION = 'JOIN_REFERENCED_VIEW_HAS_DIFFERENT_CONNECTION',

  MODEL_FIELD_WRONG_ALIAS_IN_REFERENCE = 'MODEL_FIELD_WRONG_ALIAS_IN_REFERENCE',
  MODEL_FIELD_REFS_NOT_VALID_FIELD = 'MODEL_FIELD_REFS_NOT_VALID_FIELD',
  MODEL_FIELD_REFS_FILTER = 'MODEL_FIELD_REFS_FILTER',
  MODEL_DIMENSION_REFS_MEASURE = 'MODEL_DIMENSION_REFS_MEASURE',
  MODEL_DIMENSION_REFS_CALCULATION = 'MODEL_DIMENSION_REFS_CALCULATION',
  MODEL_MEASURE_REFS_MEASURE = 'MODEL_MEASURE_REFS_MEASURE',
  MODEL_MEASURE_REFS_CALCULATION = 'MODEL_MEASURE_REFS_CALCULATION',

  // join
  JOIN_WRONG_HIDDEN = 'JOIN_WRONG_HIDDEN',
  JOIN_UNKNOWN_PARAMETER_FOR_FROM_VIEW = 'JOIN_UNKNOWN_PARAMETER_FOR_FROM_VIEW',
  JOIN_UNKNOWN_PARAMETER_FOR_JOIN_VIEW = 'JOIN_UNKNOWN_PARAMETER_FOR_JOIN_VIEW',
  JOIN_UNEXPECTED_LIST = 'JOIN_UNEXPECTED_LIST',
  JOIN_UNEXPECTED_DICTIONARY = 'JOIN_UNEXPECTED_DICTIONARY',
  JOIN_PARAMETER_IS_NOT_A_LIST = 'JOIN_PARAMETER_IS_NOT_A_LIST',

  JOIN_WRONG_TYPE = 'JOIN_WRONG_TYPE',

  JOIN_MISSING_SQL_ON = 'JOIN_MISSING_SQL_ON',

  JOIN_HIDE_AND_SHOW_FIELDS = 'JOIN_HIDE_AND_SHOW_FIELDS',
  JOIN_HIDE_FIELDS_ELEMENT_HAS_WRONG_REFERENCE = 'JOIN_HIDE_FIELDS_ELEMENT_HAS_WRONG_REFERENCE',
  JOIN_HIDE_FIELDS_ELEMENT_HAS_WRONG_ALIAS = 'JOIN_HIDE_FIELDS_ELEMENT_HAS_WRONG_ALIAS',
  JOIN_HIDE_FIELDS_ELEMENT_REFS_MISSING_VIEW_FIELD = 'JOIN_HIDE_FIELDS_ELEMENT_REFS_MISSING_VIEW_FIELD',
  JOIN_SHOW_FIELDS_ELEMENT_HAS_WRONG_REFERENCE = 'JOIN_SHOW_FIELDS_ELEMENT_HAS_WRONG_REFERENCE',
  JOIN_SHOW_FIELDS_ELEMENT_HAS_WRONG_ALIAS = 'JOIN_SHOW_FIELDS_ELEMENT_HAS_WRONG_ALIAS',
  JOIN_SHOW_FIELDS_ELEMENT_REFS_MISSING_VIEW_FIELD = 'JOIN_SHOW_FIELDS_ELEMENT_REFS_MISSING_VIEW_FIELD',

  // join-sql-on
  JOIN_WRONG_CHARS_IN_SQL_ON_REFS = 'JOIN_WRONG_CHARS_IN_SQL_ON_REFS',

  JOIN_WRONG_ALIAS_IN_SQL_ON_REFERENCE = 'JOIN_WRONG_ALIAS_IN_SQL_ON_REFERENCE',
  JOIN_SQL_ON_REFS_MISSING_FIELD = 'JOIN_SQL_ON_REFS_MISSING_FIELD',
  JOIN_SQL_ON_REFS_FILTER = 'JOIN_SQL_ON_REFS_FILTER',
  JOIN_SQL_ON_REFS_MEASURE = 'JOIN_SQL_ON_REFS_MEASURE',
  JOIN_SQL_ON_REFS_CALCULATION = 'JOIN_SQL_ON_REFS_CALCULATION',

  JOIN_SQL_ON_REFS_MODEL_MISSING_FIELD = 'JOIN_SQL_ON_REFS_MODEL_MISSING_FIELD',
  JOIN_SQL_ON_REFS_MODEL_FILTER = 'JOIN_SQL_ON_REFS_MODEL_FILTER',
  JOIN_SQL_ON_REFS_MODEL_MEASURE = 'JOIN_SQL_ON_REFS_MODEL_MEASURE',
  JOIN_SQL_ON_REFS_MODEL_CALCULATION = 'JOIN_SQL_ON_REFS_MODEL_CALCULATION',

  // join-sql-where
  JOIN_WRONG_CHARS_IN_SQL_WHERE_REFS = 'JOIN_WRONG_CHARS_IN_SQL_WHERE_REFS',

  JOIN_WRONG_ALIAS_IN_SQL_WHERE_REFERENCE = 'JOIN_WRONG_ALIAS_IN_SQL_WHERE_REFERENCE',
  JOIN_SQL_WHERE_REFS_MISSING_FIELD = 'JOIN_SQL_WHERE_REFS_MISSING_FIELD',
  JOIN_SQL_WHERE_REFS_FILTER = 'JOIN_SQL_WHERE_REFS_FILTER',
  JOIN_SQL_WHERE_REFS_MEASURE = 'JOIN_SQL_WHERE_REFS_MEASURE',
  JOIN_SQL_WHERE_REFS_CALCULATION = 'JOIN_SQL_WHERE_REFS_CALCULATION',

  JOIN_SQL_WHERE_REFS_MODEL_MISSING_FIELD = 'JOIN_SQL_WHERE_REFS_MODEL_MISSING_FIELD',
  JOIN_SQL_WHERE_REFS_MODEL_FILTER = 'JOIN_SQL_WHERE_REFS_MODEL_FILTER',
  JOIN_SQL_WHERE_REFS_MODEL_MEASURE = 'JOIN_SQL_WHERE_REFS_MODEL_MEASURE',
  JOIN_SQL_WHERE_REFS_MODEL_CALCULATION = 'JOIN_SQL_WHERE_REFS_MODEL_CALCULATION',

  JOIN_SQL_WHERE_APPLY_FILTER_REFS_MISSING_FILTER = 'JOIN_SQL_WHERE_APPLY_FILTER_REFS_MISSING_FILTER',
  JOIN_SQL_WHERE_APPLY_FILTER_MUST_REFERENCE_A_FILTER = 'JOIN_SQL_WHERE_APPLY_FILTER_MUST_REFERENCE_A_FILTER',

  // sort-joins
  CYCLE_IN_JOINS_SQL_ON_OR_SQL_WHERE = 'CYCLE_IN_JOINS_SQL_ON_OR_SQL_WHERE',

  ALWAYS_JOIN_REFS_MISSING_JOIN = 'ALWAYS_JOIN_REFS_MISSING_JOIN',
  WRONG_ALWAYS_JOIN = 'WRONG_ALWAYS_JOIN',

  // sql-always-where
  WRONG_CHARS_IN_SQL_ALWAYS_WHERE_REFS = 'WRONG_CHARS_IN_SQL_ALWAYS_WHERE_REFS',

  WRONG_ALIAS_IN_SQL_ALWAYS_WHERE_REFERENCE = 'WRONG_ALIAS_IN_SQL_ALWAYS_WHERE_REFERENCE',
  SQL_ALWAYS_WHERE_REFS_MISSING_FIELD = 'SQL_ALWAYS_WHERE_REFS_MISSING_FIELD',
  SQL_ALWAYS_WHERE_REFS_FILTER = 'SQL_ALWAYS_WHERE_REFS_FILTER',
  SQL_ALWAYS_WHERE_REFS_MEASURE = 'SQL_ALWAYS_WHERE_REFS_MEASURE',
  SQL_ALWAYS_WHERE_REFS_CALCULATION = 'SQL_ALWAYS_WHERE_REFS_CALCULATION',

  SQL_ALWAYS_WHERE_REFS_MODEL_MISSING_FIELD = 'SQL_ALWAYS_WHERE_REFS_MODEL_MISSING_FIELD',
  SQL_ALWAYS_WHERE_REFS_MODEL_FILTER = 'SQL_ALWAYS_WHERE_REFS_MODEL_FILTER',
  SQL_ALWAYS_WHERE_REFS_MODEL_MEASURE = 'SQL_ALWAYS_WHERE_REFS_MODEL_MEASURE',
  SQL_ALWAYS_WHERE_REFS_MODEL_CALCULATION = 'SQL_ALWAYS_WHERE_REFS_MODEL_CALCULATION',

  SQL_ALWAYS_WHERE_APPLY_FILTER_REFS_MISSING_FILTER = 'SQL_ALWAYS_WHERE_APPLY_FILTER_REFS_MISSING_FILTER',
  SQL_ALWAYS_WHERE_APPLY_FILTER_MUST_REFERENCE_A_FILTER = 'SQL_ALWAYS_WHERE_APPLY_FILTER_MUST_REFERENCE_A_FILTER',

  // sql-always-where-calc
  WRONG_CHARS_IN_SQL_ALWAYS_WHERE_CALC_REFS = 'WRONG_CHARS_IN_SQL_ALWAYS_WHERE_CALC_REFS',

  WRONG_ALIAS_IN_SQL_ALWAYS_WHERE_CALC_REFERENCE = 'WRONG_ALIAS_IN_SQL_ALWAYS_WHERE_CALC_REFERENCE',
  SQL_ALWAYS_WHERE_CALC_REFS_MISSING_FIELD = 'SQL_ALWAYS_WHERE_CALC_REFS_MISSING_FIELD',
  SQL_ALWAYS_WHERE_CALC_REFS_FILTER = 'SQL_ALWAYS_WHERE_CALC_REFS_FILTER',

  SQL_ALWAYS_WHERE_CALC_REFS_MODEL_MISSING_FIELD = 'SQL_ALWAYS_WHERE_CALC_REFS_MODEL_MISSING_FIELD',
  SQL_ALWAYS_WHERE_CALC_REFS_MODEL_FILTER = 'SQL_ALWAYS_WHERE_CALC_REFS_MODEL_FILTER',

  SQL_ALWAYS_WHERE_CALC_APPLY_FILTER_REFS_MISSING_FILTER = 'SQL_ALWAYS_WHERE_CALC_APPLY_FILTER_REFS_MISSING_FILTER',
  SQL_ALWAYS_WHERE_CALC_APPLY_FILTER_MUST_REFERENCE_A_FILTER = 'SQL_ALWAYS_WHERE_CALC_APPLY_FILTER_MUST_REFERENCE_A_FILTER',

  // dashboard

  // viz
  VIZ_MISSING_REPORTS = 'VIZ_MISSING_REPORTS',
  VIZ_TOO_MANY_REPORTS = 'VIZ_TOO_MANY_REPORTS',

  // report
  REPORT_IS_NOT_A_DICTIONARY = 'REPORT_IS_NOT_A_DICTIONARY',

  UNKNOWN_REPORT_PARAMETER = 'UNKNOWN_REPORT_PARAMETER',
  UNEXPECTED_LIST_IN_REPORT_PARAMETERS = 'UNEXPECTED_LIST_IN_REPORT_PARAMETERS',
  UNEXPECTED_DICTIONARY_IN_REPORT_PARAMETERS = 'UNEXPECTED_DICTIONARY_IN_REPORT_PARAMETERS',
  REPORT_PARAMETER_MUST_BE_A_LIST = 'REPORT_PARAMETER_MUST_BE_A_LIST',
  REPORT_PARAMETER_MUST_BE_A_DICTIONARY = 'REPORT_PARAMETER_MUST_BE_A_DICTIONARY',

  MISSING_REPORT_TITLE = 'MISSING_REPORT_TITLE',
  DUPLICATE_REPORT_TITLE = 'DUPLICATE_REPORT_TITLE',
  MISSING_REPORT_MODEL = 'MISSING_REPORT_MODEL',
  WRONG_REPORT_MODEL = 'WRONG_REPORT_MODEL',
  MISSING_REPORT_SELECT = 'MISSING_REPORT_SELECT',

  REPORT_WRONG_SELECT_ELEMENT = 'REPORT_WRONG_SELECT_ELEMENT',
  REPORT_WRONG_SELECT_MODEL_FIELD = 'REPORT_WRONG_SELECT_MODEL_FIELD',
  REPORT_WRONG_SELECT_ALIAS = 'REPORT_WRONG_SELECT_ALIAS',
  REPORT_WRONG_SELECT_VIEW_FIELD = 'REPORT_WRONG_SELECT_VIEW_FIELD',

  REPORT_WRONG_SORTS_SYNTAX = 'REPORT_WRONG_SORTS_SYNTAX',
  REPORT_SORTS_REFS_UNSELECTED_FIELD = 'REPORT_SORTS_REFS_UNSELECTED_FIELD',

  REPORT_WRONG_TIMEZONE = 'REPORT_WRONG_TIMEZONE',

  REPORT_WRONG_LIMIT = 'REPORT_WRONG_LIMIT',

  VIZ_REPORT_CAN_NOT_HAVE_LISTEN_FILTERS = 'VIZ_REPORT_CAN_NOT_HAVE_LISTEN_FILTERS',
  REPORT_LISTENS_MISSING_DASHBOARD_FILTER = 'REPORT_LISTENS_MISSING_DASHBOARD_FILTER',
  REPORT_WRONG_LISTENER = 'REPORT_WRONG_LISTENER',
  REPORT_WRONG_LISTENER_MODEL_FIELD = 'REPORT_WRONG_LISTENER_MODEL_FIELD',
  REPORT_MODEL_FIELD_LISTENS_MORE_THAN_ONE_FILTER = 'REPORT_MODEL_FIELD_LISTENS_MORE_THAN_ONE_FILTER',
  REPORT_FILTER_AND_MODEL_FIELD_RESULTS_MISMATCH = 'REPORT_FILTER_AND_MODEL_FIELD_RESULTS_MISMATCH',
  REPORT_WRONG_LISTENER_ALIAS = 'REPORT_WRONG_LISTENER_ALIAS',
  REPORT_WRONG_LISTENER_VIEW_FIELD = 'REPORT_WRONG_LISTENER_VIEW_FIELD',
  REPORT_VIEW_FIELD_LISTENS_MORE_THAN_ONE_FILTER = 'REPORT_VIEW_FIELD_LISTENS_MORE_THAN_ONE_FILTER',
  REPORT_FILTER_AND_VIEW_FIELD_RESULTS_MISMATCH = 'REPORT_FILTER_AND_VIEW_FIELD_RESULTS_MISMATCH',

  REPORT_DEFAULT_FILTER_WRONG_REFERENCE = 'REPORT_DEFAULT_FILTER_WRONG_REFERENCE',
  REPORT_DEFAULT_FILTER_REFS_MISSING_MODEL_FIELD = 'REPORT_DEFAULT_FILTER_REFS_MISSING_MODEL_FIELD',
  REPORT_DEFAULT_FILTER_REFS_MISSING_ALIAS = 'REPORT_DEFAULT_FILTER_REFS_MISSING_ALIAS',
  REPORT_DEFAULT_FILTER_REFS_MISSING_VIEW_FIELD = 'REPORT_DEFAULT_FILTER_REFS_MISSING_VIEW_FIELD',
  REPORT_SAME_FIELD_IN_DEFAULT_AND_LISTEN_FILTERS = 'REPORT_SAME_FIELD_IN_DEFAULT_AND_LISTEN_FILTERS',
  REPORT_DEFAULT_FILTER_MUST_BE_A_LIST = 'REPORT_DEFAULT_FILTER_MUST_BE_A_LIST',
  REPORT_DEFAULT_FILTER_WRONG_FILTER_EXPRESSION = 'REPORT_DEFAULT_FILTER_WRONG_FILTER_EXPRESSION',

  // chart
  REPORT_MISSING_TYPE = 'REPORT_MISSING_TYPE',
  REPORT_WRONG_TYPE = 'REPORT_WRONG_TYPE',

  REPORT_DATA_UNKNOWN_PARAMETER = 'REPORT_DATA_UNKNOWN_PARAMETER',
  REPORT_DATA_UNEXPECTED_LIST = 'REPORT_DATA_UNEXPECTED_LIST',
  REPORT_DATA_UNEXPECTED_DICTIONARY = 'REPORT_DATA_UNEXPECTED_DICTIONARY',

  REPORT_DATA_MISSING_X_FIELD = 'REPORT_DATA_MISSING_X_FIELD',
  REPORT_DATA_MISSING_Y_FIELD = 'REPORT_DATA_MISSING_Y_FIELD',
  REPORT_DATA_MISSING_Y_FIELDS = 'REPORT_DATA_MISSING_Y_FIELDS',
  REPORT_DATA_MISSING_VALUE_FIELD = 'REPORT_DATA_MISSING_VALUE_FIELD',
  REPORT_DATA_WRONG_X_FIELD = 'REPORT_DATA_WRONG_X_FIELD',
  REPORT_DATA_WRONG_X_FIELD_CLASS = 'REPORT_DATA_WRONG_X_FIELD_CLASS',
  REPORT_DATA_WRONG_Y_FIELD_CLASS = 'REPORT_DATA_WRONG_Y_FIELD_CLASS',
  REPORT_DATA_WRONG_MULTI_FIELD_CLASS = 'REPORT_DATA_WRONG_MULTI_FIELD_CLASS',
  REPORT_DATA_WRONG_VALUE_FIELD_CLASS = 'REPORT_DATA_WRONG_VALUE_FIELD_CLASS',
  REPORT_DATA_WRONG_PREVIOUS_VALUE_FIELD_CLASS = 'REPORT_DATA_WRONG_PREVIOUS_VALUE_FIELD_CLASS',
  REPORT_DATA_WRONG_Y_FIELDS_ELEMENT_FIELD_CLASS = 'REPORT_DATA_WRONG_Y_FIELDS_ELEMENT_FIELD_CLASS',
  REPORT_DATA_WRONG_Y_FIELD = 'REPORT_DATA_WRONG_Y_FIELD',
  REPORT_DATA_WRONG_MULTI_FIELD = 'REPORT_DATA_WRONG_MULTI_FIELD',
  REPORT_DATA_WRONG_VALUE_FIELD = 'REPORT_DATA_WRONG_VALUE_FIELD',
  REPORT_DATA_WRONG_PREVIOUS_VALUE_FIELD = 'REPORT_DATA_WRONG_PREVIOUS_VALUE_FIELD',
  REPORT_DATA_Y_FIELDS_MUST_BE_A_LIST = 'REPORT_DATA_Y_FIELDS_MUST_BE_A_LIST',
  REPORT_DATA_WRONG_Y_FIELDS_ELEMENT = 'REPORT_DATA_WRONG_Y_FIELDS_ELEMENT',
  REPORT_DATA_HIDE_COLUMNS_MUST_BE_A_LIST = 'REPORT_DATA_HIDE_COLUMNS_MUST_BE_A_LIST',
  REPORT_DATA_WRONG_HIDE_COLUMNS_ELEMENT = 'REPORT_DATA_WRONG_HIDE_COLUMNS_ELEMENT',

  REPORT_AXIS_UNKNOWN_PARAMETER = 'REPORT_AXIS_UNKNOWN_PARAMETER',
  REPORT_AXIS_UNEXPECTED_LIST = 'REPORT_AXIS_UNEXPECTED_LIST',
  REPORT_AXIS_UNEXPECTED_DICTIONARY = 'REPORT_AXIS_UNEXPECTED_DICTIONARY',
  REPORT_AXIS_WRONG_PARAMETER_VALUE = 'REPORT_AXIS_WRONG_PARAMETER_VALUE',

  REPORT_OPTIONS_UNKNOWN_PARAMETER = 'REPORT_OPTIONS_UNKNOWN_PARAMETER',
  REPORT_OPTIONS_UNEXPECTED_LIST = 'REPORT_OPTIONS_UNEXPECTED_LIST',
  REPORT_OPTIONS_UNEXPECTED_DICTIONARY = 'REPORT_OPTIONS_UNEXPECTED_DICTIONARY',
  REPORT_OPTIONS_WRONG_PARAMETER_VALUE = 'REPORT_OPTIONS_WRONG_PARAMETER_VALUE',
  REPORT_OPTIONS_WRONG_INTERPOLATION = 'REPORT_OPTIONS_WRONG_INTERPOLATION',
  REPORT_OPTIONS_WRONG_COLOR_SCHEME = 'REPORT_OPTIONS_WRONG_COLOR_SCHEME',
  REPORT_OPTIONS_WRONG_SCHEME_TYPE = 'REPORT_OPTIONS_WRONG_SCHEME_TYPE',
  REPORT_OPTIONS_PARAMETER_MUST_BE_A_POSITIVE_INTEGER = 'REPORT_OPTIONS_PARAMETER_MUST_BE_A_POSITIVE_INTEGER',
  REPORT_OPTIONS_PARAMETER_MUST_BE_A_NUMBER = 'REPORT_OPTIONS_PARAMETER_MUST_BE_A_NUMBER',
  REPORT_OPTIONS_PARAMETER_MUST_BE_AN_INTEGER = 'REPORT_OPTIONS_PARAMETER_MUST_BE_AN_INTEGER',
  REPORT_OPTIONS_WRONG_COLOR = 'REPORT_OPTIONS_WRONG_COLOR',

  REPORT_TILE_UNKNOWN_PARAMETER = 'REPORT_TILE_UNKNOWN_PARAMETER',
  REPORT_TILE_UNEXPECTED_LIST = 'REPORT_TILE_UNEXPECTED_LIST',
  REPORT_TILE_UNEXPECTED_DICTIONARY = 'REPORT_TILE_UNEXPECTED_DICTIONARY',
  REPORT_TILE_WRONG_TILE_WIDTH = 'REPORT_TILE_WRONG_TILE_WIDTH',
  REPORT_TILE_WRONG_TILE_HEIGHT = 'REPORT_TILE_WRONG_TILE_HEIGHT',
  REPORT_TILE_PARAMETER_MUST_BE_A_POSITIVE_INTEGER = 'REPORT_TILE_PARAMETER_MUST_BE_A_POSITIVE_INTEGER',

  // special
  WRONG_FILTER_EXPRESSION = 'WRONG_FILTER_EXPRESSION',
  WRONG_ACCESS_USERS_ELEMENT = 'WRONG_ACCESS_USERS_ELEMENT',
  WRONG_ACCESS_ROLES_ELEMENT = 'WRONG_ACCESS_ROLES_ELEMENT'
}
