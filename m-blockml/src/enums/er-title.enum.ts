export enum ErTitleEnum {
  WRONG_FILE_EXTENSION = 'WRONG_FILE_EXTENSION',

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
  UNKNOWN_VISUALIZATION_PARAMETER = 'UNKNOWN_VISUALIZATION_PARAMETER',
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
  WRONG_VISUALIZATION_NAME = 'WRONG_VISUALIZATION_NAME',

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

  MISSING_TABLE = 'MISSING_TABLE',

  WRONG_UDF = 'WRONG_UDF',

  WRONG_FILTER_EXPRESSION = 'WRONG_FILTER_EXPRESSION',
  DASHBOARD_FILTER_MUST_HAVE_DEFAULT = 'DASHBOARD_FILTER_MUST_HAVE_DEFAULT',

  APPLY_FILTER_REFS_MISSING_FILTER = 'APPLY_FILTER_REFS_MISSING_FILTER',
  APPLY_FILTER_MUST_REFERENCE_A_FILTER = 'APPLY_FILTER_MUST_REFERENCE_A_FILTER',

  DERIVED_TABLE_VIEW_SELF_REFERENCE = 'DERIVED_TABLE_VIEW_SELF_REFERENCE',
  DERIVED_TABLE_SAME_ALIAS_FOR_DIFFERENT_VIEWS = 'DERIVED_TABLE_SAME_ALIAS_FOR_DIFFERENT_VIEWS',
  DERIVED_TABLE_NO_VIEW_REFERENCE = 'DERIVED_TABLE_NO_VIEW_REFERENCE',

  DERIVED_TABLE_CYCLE_IN_VIEW_REFERENCES = 'DERIVED_TABLE_CYCLE_IN_VIEW_REFERENCES',

  DERIVED_TABLE_REFERENCES_MISSING_VIEW = 'DERIVED_TABLE_REFERENCES_MISSING_VIEW',
  DERIVED_TABLE_REFERENCED_VIEW_HAS_APPLY_FILTER = 'DERIVED_TABLE_REFERENCED_VIEW_HAS_APPLY_FILTER',
  DERIVED_TABLE_REFERENCES_MISSING_FIELD = 'DERIVED_TABLE_REFERENCES_MISSING_FIELD',
  DERIVED_TABLE_REFERENCES_FILTER = 'DERIVED_TABLE_REFERENCES_FILTER',

  WRONG_MODEL_ACCESS_USERS_ELEMENT = 'WRONG_MODEL_ACCESS_USERS_ELEMENT',

  WRONG_MODEL_UDF = 'WRONG_MODEL_UDF',

  MISSING_JOINS = 'MISSING_JOINS',

  FROM_VIEW_AND_JOIN_VIEW = 'FROM_VIEW_AND_JOIN_VIEW',
  MISSING_FROM_VIEW_OR_JOIN_VIEW = 'MISSING_FROM_VIEW_OR_JOIN_VIEW',
  MISSING_FROM_VIEW_ELEMENT = 'MISSING_FROM_VIEW_ELEMENT',
  TOO_MANY_FROM_VIEW = 'TOO_MANY_FROM_VIEW',

  MISSING_AS = 'MISSING_AS',
  DUPLICATE_ALIASES = 'DUPLICATE_ALIASES',

  JOIN_CALLS_MISSING_VIEW = 'JOIN_CALLS_MISSING_VIEW',

  MODEL_FIELD_WRONG_ALIAS_IN_REFERENCE = 'MODEL_FIELD_WRONG_ALIAS_IN_REFERENCE',
  MODEL_FIELD_REFS_NOT_VALID_FIELD = 'MODEL_FIELD_REFS_NOT_VALID_FIELD',
  MODEL_FIELD_REFS_FILTER = 'MODEL_FIELD_REFS_FILTER',
  MODEL_DIMENSION_REFS_MEASURE = 'MODEL_DIMENSION_REFS_MEASURE',
  MODEL_DIMENSION_REFS_CALCULATION = 'MODEL_DIMENSION_REFS_CALCULATION',
  MODEL_MEASURE_REFS_MEASURE = 'MODEL_MEASURE_REFS_MEASURE',
  MODEL_MEASURE_REFS_CALCULATION = 'MODEL_MEASURE_REFS_CALCULATION',

  JOIN_WRONG_HIDDEN = 'JOIN_WRONG_HIDDEN',
  JOIN_UNKNOWN_PARAMETER_FOR_FROM_VIEW = 'JOIN_UNKNOWN_PARAMETER_FOR_FROM_VIEW',
  JOIN_UNKNOWN_PARAMETER_FOR_JOIN_VIEW = 'JOIN_UNKNOWN_PARAMETER_FOR_JOIN_VIEW',
  JOIN_UNEXPECTED_LIST = 'JOIN_UNEXPECTED_LIST',
  JOIN_UNEXPECTED_DICTIONARY = 'JOIN_UNEXPECTED_DICTIONARY',

  JOIN_WRONG_TYPE = 'JOIN_WRONG_TYPE',

  JOIN_MISSING_SQL_ON = 'JOIN_MISSING_SQL_ON',
  //
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
  //
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
  //
  CYCLE_IN_JOINS_SQL_ON_OR_SQL_WHERE = 'CYCLE_IN_JOINS_SQL_ON_OR_SQL_WHERE',

  ALWAYS_JOIN_REFS_MISSING_JOIN = 'ALWAYS_JOIN_REFS_MISSING_JOIN',
  WRONG_ALWAYS_JOIN = 'WRONG_ALWAYS_JOIN',
  //
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
  //
  WRONG_CHARS_IN_SQL_ALWAYS_WHERE_CALC_REFS = 'WRONG_CHARS_IN_SQL_ALWAYS_WHERE_CALC_REFS',

  WRONG_ALIAS_IN_SQL_ALWAYS_WHERE_CALC_REFERENCE = 'WRONG_ALIAS_IN_SQL_ALWAYS_WHERE_CALC_REFERENCE',
  SQL_ALWAYS_WHERE_CALC_REFS_MISSING_FIELD = 'SQL_ALWAYS_WHERE_CALC_REFS_MISSING_FIELD',
  SQL_ALWAYS_WHERE_CALC_REFS_FILTER = 'SQL_ALWAYS_WHERE_CALC_REFS_FILTER',
  // SQL_ALWAYS_WHERE_CALC_REFS_MEASURE = 'SQL_ALWAYS_WHERE_CALC_REFS_MEASURE',
  // SQL_ALWAYS_WHERE_CALC_REFS_CALCULATION = 'SQL_ALWAYS_WHERE_CALC_REFS_CALCULATION',

  SQL_ALWAYS_WHERE_CALC_REFS_MODEL_MISSING_FIELD = 'SQL_ALWAYS_WHERE_CALC_REFS_MODEL_MISSING_FIELD',
  SQL_ALWAYS_WHERE_CALC_REFS_MODEL_FILTER = 'SQL_ALWAYS_WHERE_CALC_REFS_MODEL_FILTER',
  // SQL_ALWAYS_WHERE_CALC_REFS_MODEL_MEASURE = 'SQL_ALWAYS_WHERE_CALC_REFS_MODEL_MEASURE',
  // SQL_ALWAYS_WHERE_CALC_REFS_MODEL_CALCULATION = 'SQL_ALWAYS_WHERE_CALC_REFS_MODEL_CALCULATION',

  SQL_ALWAYS_WHERE_CALC_APPLY_FILTER_REFS_MISSING_FILTER = 'SQL_ALWAYS_WHERE_CALC_APPLY_FILTER_REFS_MISSING_FILTER',
  SQL_ALWAYS_WHERE_CALC_APPLY_FILTER_MUST_REFERENCE_A_FILTER = 'SQL_ALWAYS_WHERE_CALC_APPLY_FILTER_MUST_REFERENCE_A_FILTER'
  //
}
