export enum FuncEnum {
  CollectFiles = '01-yaml/1-collect-files',
  RemoveWrongExt = '01-yaml/2-remove-wrong-ext',
  DeduplicateFileNames = '01-yaml/3-deduplicate-file-names',
  YamlToObjects = '01-yaml/4-yaml-to-objects',
  MakeLineNumbers = '01-yaml/5-make-line-numbers',
  CheckTopUnknownParameters = '01-yaml/6-check-top-unknown-parameters',
  CheckTopValues = '01-yaml/7-check-top-values',
  CheckConnections = '01-yaml/8-check-connections',
  CheckSupportUdfs = '01-yaml/9-check-support-udfs',
  SplitFiles = '01-yaml/10-split-files',

  CheckFieldsExist = '02-field/1-check-fields-exist',
  CheckFieldIsObject = '02-field/2-check-field-is-object',
  CheckFieldDeclaration = '02-field/3-check-field-declaration',
  CheckSqlExist = '02-field/4-check-sql-exist',
  CheckFieldNameDuplicates = '02-field/5-check-field-name-duplicates',
  CheckFieldUnknownParameters = '02-field/6-check-field-unknown-parameters',
  SetImplicitLabel = '02-field/7-set-implicit-label',
  CheckDimensions = '02-field/8-check-dimensions',
  TransformYesNoDimensions = '02-field/9-transform-yesno-dimensions',
  CheckMeasures = '02-field/10-check-measures',
  CheckCalculations = '02-field/11-check-calculations',
  CheckAndSetImplicitResult = '02-field/12-check-and-set-implicit-result',
  CheckAndSetImplicitFormatNumber = '02-field/13-check-and-set-implicit-format-number',
  TransformTimes = '02-field/14-transform-times',
  MakeFieldsDeps = '02-field/15-make-fields-deps',
  CheckFieldsDeps = '02-field/16-check-fields-deps',
  CheckCycles = '02-field/17-check-cycles',
  SubstituteSingleRefs = '02-field/18-substitute-single-refs',

  MakeUdfsDict = '03-udf/1-make-udfs-dict',

  CheckTable = '04-view/1-check-table',
  CheckViewUdfs = '04-view/2-check-view-udfs',
  CheckViewFilterDefaults = '04-view/3-check-view-filter-defaults',
  CheckDerivedTableApplyFilter = '04-view/4-check-derived-table-apply-filter',
  MakeViewAsDeps = '04-view/5-make-view-as-deps',
  CheckViewCycles = '04-view/6-check-view-cycles',
  CheckViewAsDeps = '04-view/7-check-view-as-deps',
  PickUdfsFromAsDeps = '04-view/8-pick-udfs-from-as-deps',
  ProcessViewRefs = '04-view/9-process-view-refs',

  CheckModelAccessUsers = '05-model/1-check-model-access-users',
  CheckModelUdfs = '05-model/2-check-model-udfs',
  CheckJoinsExist = '05-model/3-check-joins-exist',
  CheckJoinsFromView = '05-model/4-check-joins-from-view',
  CheckAliases = '05-model/5-check-aliases',
  MakeJoins = '05-model/6-make-joins',
  UpgradeModelCalculationsForceDims = '05-model/7-upgrade-model-calculations-force-dims',
  MakeFieldsDoubleDeps = '05-model/8-make-fields-double-deps',
  CheckFieldsDoubleDeps = '05-model/9-check-fields-double-deps',
  MakeFieldsDoubleDepsAfterSingles = '05-model/10-make-fields-double-deps-after-singles',
  CheckModelFilterDefaults = '05-model/11-check-model-filter-defaults',

  CheckJoinUnknownParameters = '06-join/1-check-join-unknown-parameters',
  CheckJoinType = '06-join/2-check-join-type',
  UpgradeJoinCalculationsForceDims = '06-join/3-upgrade-join-calculations-force-dims',
  CheckSqlOnExist = '06-join/4-check-sql-on-exist',

  JsoCheckCharsInRefs = '07-join-sql-on/1-jso-check-chars-in-refs',
  JsoMakeDoubleDeps = '07-join-sql-on/2-jso-make-double-deps',
  JsoCheckDoubleDeps = '07-join-sql-on/3-jso-check-double-deps',
  JsoCheckSingleRefs = '07-join-sql-on/4-jso-check-single-refs',
  JsoSubstituteSingleRefs = '07-join-sql-on/5-jso-substitute-single-refs',
  JsoMakeJoinsDoubleDepsAfterSingles = '07-join-sql-on/6-jso-make-joins-double-deps-after-singles',

  JswCheckCharsInRefs = '08-join-sql-where/1-jsw-check-chars-in-refs',
  JswMakeDoubleDeps = '08-join-sql-where/2-jsw-make-double-deps',
  JswCheckDoubleDeps = '08-join-sql-where/3-jsw-check-double-deps',
  JswCheckSingleRefs = '08-join-sql-where/4-jsw-check-single-refs',
  JswSubstituteSingleRefs = '08-join-sql-where/5-jsw-substitute-single-refs',
  JswUpdateJoinsDoubleDepsAfterSingles = '08-join-sql-where/6-jsw-update-joins-double-deps-after-singles',
  JswCheckApplyFilter = '08-join-sql-where/7-jsw-check-apply-filter',

  CheckJoinsCyclesAndToposort = '09-sort-joins/1-check-joins-cycles-and-toposort',
  CheckAlwaysJoin = '09-sort-joins/2-check-always-join',

  SawCheckCharsInRefs = '10-sql-always-where/1-saw-check-chars-in-refs',
  SawMakeDoubleDeps = '10-sql-always-where/2-saw-make-double-deps',
  SawCheckDoubleDeps = '10-sql-always-where/3-saw-check-double-deps',
  SawCheckSingleRefs = '10-sql-always-where/4-saw-check-single-refs',
  SawSubstituteSingleRefs = '10-sql-always-where/5-saw-substitute-single-refs',
  SawMakeDoubleDepsAfterSingles = '10-sql-always-where/6-saw-make-double-deps-after-singles',
  SawCheckApplyFilter = '10-sql-always-where/7-saw-check-apply-filter',
  SawUpdateAlwaysJoinUnique = '10-sql-always-where/8-saw-update-always-join-unique',

  AwcCheckCharsInRefs = '11-sql-always-where-calc/1-awc-check-chars-in-refs',
  AwcMakeDoubleDeps = '11-sql-always-where-calc/2-awc-make-double-deps',
  AwcCheckDoubleDeps = '11-sql-always-where-calc/3-awc-check-double-deps',
  AwcCheckSingleRefs = '11-sql-always-where-calc/4-awc-check-single-refs',
  AwcSubstituteSingleRefs = '11-sql-always-where-calc/5-awc-substitute-single-refs',
  AwcMakeDoubleDepsAfterSingles = '11-sql-always-where-calc/6-awc-make-double-deps-after-singles',
  AwcCheckApplyFilter = '11-sql-always-where-calc/7-awc-check-apply-filter',
  AwcUpdateAlwaysJoinUnique = '11-sql-always-where-calc/8-awc-update-always-join-unique',

  CheckDashboardAccessUsers = '12-dashboard/1-check-dashboard-access-users',
  CheckDashboardFilterDefaults = '12-dashboard/2-check-dashboard-filter-defaults',
  CheckReportsExist = '12-dashboard/3-check-reports-exist',

  CheckReportIsObject = '13-report/1-check-report-is-object',
  CheckReportUnknownParameters = '13-report/2-check-report-unknown-parameters',
  CheckReportTitleModelSelect = '13-report/3-check-report-title-model-select',
  CheckSelectElements = '13-report/4-check-select-elements',
  CheckSelectForceDims = '13-report/5-check-select-force-dims',
  CheckSorts = '13-report/6-check-sorts',
  CheckTimezone = '13-report/7-check-timezone',

  CheckVMDFilterDefaults = 'shared/check-vmd-filter-defaults',

  LogStruct = 'builder/log-struct'
}
