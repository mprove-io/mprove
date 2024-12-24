export enum CallerEnum {
  BuildYaml = '01-BuildYaml',

  BuildViewField = '02-BuildViewField',
  BuildModelField = '02-BuildModelField',
  BuildDashboardField = '02-BuildDashboardField',
  BuildReportField = '02-BuildReportField',

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
  BuildChart = '13-BuildChart',

  BuildDashboardTile = '14-BuildDashboardTile',
  BuildChartTile = '14-BuildChartTile',

  BuildDashboardTileCharts = '15-BuildDashboardTileCharts',
  BuildChartTileCharts = '15-BuildChartTileCharts',

  BuildReport = '17-BuildReport',

  BuildCheckVmdSuggestModelDimension = 'BuildCheckVmdSuggestModelDimension',
  BuildViewModel = 'BuildViewModel',

  RebuildStruct = 'RebuildStruct',
  ProcessQuery = 'ProcessQuery'
}
