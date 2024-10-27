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
  BuildModelMetric = '11.1-BuildModelMetric',
  BuildDashboard = '12-BuildDashboard',
  BuildViz = '13-BuildViz',

  BuildDashboardTile = '14-BuildDashboardTile',
  BuildVizTile = '14-BuildVizTile',

  BuildDashboardChart = '15-BuildDashboardChart',
  BuildVizChart = '15-BuildVizChart',

  BuildRep = '17-BuildRep',

  RebuildStruct = 'RebuildStruct',
  ProcessQuery = 'ProcessQuery'
}
