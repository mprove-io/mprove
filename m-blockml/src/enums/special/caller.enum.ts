export enum CallerEnum {
  BuildYaml = '01-BuildYaml',

  BuildViewField = '02-BuildViewField',
  BuildModelField = '02-BuildModelField',
  BuildDashboardField = '02-BuildDashboardField',

  BuildUdf = '03-BuildUdf',
  BuildView = '04-BuildView',
  BuildModel = '05-BuildModel',
  BuildJoin = '06-BuildJoin',
  BuildJoinSqlOn = '07-BuildJoinSqlOn',
  BuildJoinSqlWhere = '08-BuildJoinSqlWhere',
  BuildSortJoins = '09-BuildSortJoins',
  BuildSqlAlwaysWhere = '10-BuildSqlAlwaysWhere',
  BuildSqlAlwaysWhereCalc = '11-BuildSqlAlwaysWhereCalc',
  BuildDashboard = '12-BuildDashboard',
  BuildReport = '13-BuildReport',
  BuildChart = '14-BuildChart',

  RebuildStruct = 'RebuildStruct',
  ProcessDashboard = 'ProcessDashboard',
  ProcessQuery = 'ProcessQuery'
}
