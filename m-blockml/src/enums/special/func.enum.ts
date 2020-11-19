export enum FuncEnum {
  CollectFiles = '1-yaml/1-collect-files',
  RemoveWrongExt = '1-yaml/2-remove-wrong-ext',
  DeduplicateFileNames = '1-yaml/3-deduplicate-file-names',
  YamlToObjects = '1-yaml/4-yaml-to-objects',
  MakeLineNumbers = '1-yaml/5-make-line-numbers',
  CheckTopUnknownParameters = '1-yaml/6-check-top-unknown-parameters',
  CheckTopValues = '1-yaml/7-check-top-values',
  CheckConnections = '1-yaml/8-check-connections',
  CheckSupportUdfs = '1-yaml/9-check-support-udfs',
  SplitFiles = '1-yaml/10-split-files',

  CheckFieldsExist = '2-field/1-check-fields-exist',
  CheckFieldIsObject = '2-field/2-check-field-is-object',
  CheckFieldDeclaration = '2-field/3-check-field-declaration',
  CheckSqlExist = '2-field/4-check-sql-exist',
  CheckFieldNameDuplicates = '2-field/5-check-field-name-duplicates',
  CheckFieldUnknownParameters = '2-field/6-check-field-unknown-parameters',
  SetImplicitLabel = '2-field/7-set-implicit-label',
  CheckDimensions = '2-field/8-check-dimensions',
  TransformYesNoDimensions = '2-field/9-transform-yesno-dimensions',
  CheckMeasures = '2-field/10-check-measures',
  CheckCalculations = '2-field/11-check-calculations',
  CheckAndSetImplicitResult = '2-field/12-check-and-set-implicit-result',
  CheckAndSetImplicitFormatNumber = '2-field/13-check-and-set-implicit-format-number',
  TransformTimes = '2-field/14-transform-times',
  MakeFieldsDeps = '2-field/15-make-fields-deps',
  CheckFieldsDeps = '2-field/16-check-fields-deps',
  CheckCycles = '2-field/17-check-cycles',
  SubstituteSingleRefs = '2-field/18-substitute-single-refs',

  MakeUdfsDict = '3-udf/1-make-udfs-dict',

  CheckTable = '4-view/1-check-table',

  LogStruct = 'struct/log-struct'
}
