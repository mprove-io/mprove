import { api } from '../barrels/api';
import { barYaml } from '../barrels/bar-yaml';
import { Injectable } from '@nestjs/common';
import { interfaces } from '../barrels/interfaces';
import { BmError } from '../models/bm-error';
// import { barChart } from '../barrels/bar-chart';
// import { barDashboard } from '../barrels/bar-dashboard';
// import { barField } from '../barrels/bar-field';
// import { barFilter } from '../barrels/bar-filter';
// import { barJoin } from '../barrels/bar-join';
// import { barJoinSqlWhere } from '../barrels/bar-join-sql-where';
// import { barModel } from '../barrels/bar-model';
// import { barModelSqlAlwaysWhere } from '../barrels/bar-model-sql-always-where';
// import { barModelSqlAlwaysWhereCalc } from '../barrels/bar-model-sql-always-where-calc';
// import { barReport } from '../barrels/bar-report';
// import { barUdf } from '../barrels/bar-udf';
// import { barView } from '../barrels/bar-view';
// import { ErrorsCollector } from '../barrels/errors-collector';

@Injectable()
export class StructService {
  async rebuildStruct(item: {
    dir: string;
    structId: string;
    projectId: string;
    weekStart: api.ProjectWeekStartEnum;
    connections: api.ProjectConnection[];
  }): Promise<interfaces.Struct> {
    let files: api.File[] = await barYaml.collectFiles({
      dir: item.dir,
      structId: item.structId
    });

    return await this.rebuildStructStateless({
      files: files,
      structId: item.structId,
      projectId: item.projectId,
      weekStart: item.weekStart,
      connections: item.connections
    });
  }

  async rebuildStructStateless(item: {
    files: api.File[];
    structId: string;
    projectId: string;
    weekStart: api.ProjectWeekStartEnum;
    connections: api.ProjectConnection[];
  }): Promise<interfaces.Struct> {
    let errors: BmError[] = [];
    let udfs: interfaces.Udf[] = [];
    let views: interfaces.View[] = [];
    let models: interfaces.Model[] = [];
    let dashboards: interfaces.Dashboard[] = [];
    let visualizations: interfaces.Visualization[] = [];

    // barYaml

    let file2s: interfaces.File2[] = barYaml.removeWrongExt({
      files: item.files,
      errors: errors,
      structId: item.structId
    });
    let file3s: interfaces.File3[] = barYaml.deduplicateFileNames({
      file2s: file2s,
      errors: errors,
      structId: item.structId
    });
    let filesAny: any[] = barYaml.yamlToObjects({
      file3s: file3s,
      errors: errors,
      structId: item.structId
    });
    filesAny = barYaml.makeLineNumbers({
      filesAny: filesAny,
      errors: errors,
      structId: item.structId
    });
    // filesAny = barYaml.checkTopUnknownParameters({ filesAny: filesAny });
    // filesAny = barYaml.checkTopValues({ filesAny: filesAny });
    // filesAny = barYaml.checkSupportUdfs({
    //   filesAny: filesAny,
    //   connection: item.connection
    // });

    // let splitFilesResult = barYaml.splitFiles({ filesAny: filesAny });

    // let udfs: interfaces.Udf[] = splitFilesResult.udfs;
    // let views: interfaces.View[] = splitFilesResult.views;
    // let models: interfaces.Model[] = splitFilesResult.models;
    // let dashboards: interfaces.Dashboard[] = splitFilesResult.dashboards;

    // // ApField - Views
    // views = barField.checkFieldsIsArray({ entities: views }); //           *prepare_fields_ary
    // // missed in old blockml
    // views = barField.checkFieldIsObject({ entities: views });
    // views = barField.checkFieldDeclaration({ entities: views }); //        *prepare_fields_ary
    // views = barField.checkSqlExist({ entities: views }); //                *prepare_fields_ary
    // // *prepare_fields_keys && *make_fields
    // views = barField.checkFieldNameDuplicates({ entities: views });
    // views = barField.checkFieldUnknownParameters({ entities: views });
    // views = barField.setImplicitLabel({ entities: views });
    // views = barField.checkDimensions({
    //   entities: views,
    //   connection: item.connection
    // });
    // views = barField.transformYesNoDimensions({ entities: views });
    // views = barField.checkMeasures({
    //   entities: views,
    //   connection: item.connection
    // });
    // views = barField.checkCalculations({ entities: views });
    // views = barField.checkAndSetImplicitResults({ entities: views });
    // views = barField.checkAndSetImplicitFormatNumber({ entities: views });
    // views = barField.transformTimes({
    //   entities: views,
    //   weekStart: item.weekStart,
    //   connection: item.connection
    // });
    // // ->check_chars_in_refs
    // views = barField.makeFieldsDeps({ entities: views });
    // // with restart
    // views = barField.checkFieldsDeps({ entities: views });
    // views = barField.checkCycles({ entities: views });
    // // {fields_deps_after_singles: ...} , {prep_force_dims: ...}
    // views = barField.substituteSingleRefs({ entities: views });

    // // ApField - Models (same as for Views)
    // models = barField.checkFieldsIsArray({ entities: models });
    // models = barField.checkFieldIsObject({ entities: models });
    // models = barField.checkFieldDeclaration({ entities: models });
    // models = barField.checkSqlExist({ entities: models });
    // models = barField.checkFieldNameDuplicates({ entities: models });
    // models = barField.checkFieldUnknownParameters({ entities: models });
    // models = barField.setImplicitLabel({ entities: models });
    // models = barField.checkDimensions({
    //   entities: models,
    //   connection: item.connection
    // });
    // models = barField.transformYesNoDimensions({ entities: models });
    // models = barField.checkMeasures({
    //   entities: models,
    //   connection: item.connection
    // });
    // models = barField.checkCalculations({ entities: models });
    // models = barField.checkAndSetImplicitResults({ entities: models });
    // models = barField.checkAndSetImplicitFormatNumber({ entities: models });
    // models = barField.transformTimes({
    //   entities: models,
    //   weekStart: item.weekStart,
    //   connection: item.connection
    // });
    // models = barField.makeFieldsDeps({ entities: models });
    // models = barField.checkFieldsDeps({ entities: models });
    // models = barField.checkCycles({ entities: models });
    // models = barField.substituteSingleRefs({ entities: models });

    // // ApView
    // views = barView.checkTable({ views: views });
    // views = barView.checkPermanent({ views: views });
    // views = barView.checkPdtTriggerSql({ views: views });
    // views = barView.checkPdtTriggerTime({ views: views });
    // views = barView.checkViewUdfs({
    //   views: views,
    //   udfs: udfs
    // });
    // views = barView.checkViewFiltersFromField({ views: views });

    // // ApFilter
    // views = barFilter.checkVMDFilterDefaults({
    //   entities: views,
    //   weekStart: item.weekStart,
    //   connection: item.connection
    // });

    // // ApView
    // views = barView.checkDerivedTableApplyFilter({ views: views });

    // // process view references
    // let udfsDict: interfaces.UdfsDict = barUdf.makeUdfsDict({
    //   udfs_user: udfs
    // });

    // views = barView.makeViewAsDeps({ views: views });
    // views = barView.checkViewCycles({ views: views });
    // views = barView.checkViewDeps({ views: views });
    // views = barView.pickUdfsAndMakePdtViewDeps({ views: views });
    // views = await barView.processViewRefs({
    //   views: views,
    //   udfs_dict: udfsDict,
    //   timezone: 'UTC',
    //   weekStart: item.weekStart,
    //   connection: item.connection,
    //   bqProject: item.bqProject,
    //   projectId: item.projectId,
    //   structId: item.structId
    // });
    // views = barView.swapDerivedTables({ views: views });

    // // api pdt_deps

    // pdts = barView.makePdts({
    //   views: views,
    //   udfs_dict: udfsDict,
    //   structId: item.structId,
    //   connection: item.connection,
    //   bqProject: item.bqProject,
    //   projectId: item.projectId
    // });

    // pdts = barView.processPdtTriggerTime({ pdts: pdts });
    // pdts = barView.processPdtTriggerSqlTableId({ pdts: pdts });
    // pdts = barView.processPdtTriggerSqlTableRef({ pdts: pdts });

    // let pdtsSorted = barView.sortPdts({ pdts: pdts });

    // // ApModel
    // models = barModel.checkModelAccessUsers({ models: models });
    // models = barModel.checkModelUdfs({
    //   models: models,
    //   udfs: udfs
    // });
    // models = barModel.checkJoinsIsArray({ models: models });
    // models = barModel.checkJoinsFromView({ models: models });
    // models = barModel.checkAliases({ models: models });
    // models = barModel.makeJoinsAndSetLabelsAndDescriptions({
    //   models: models,
    //   views: views
    // });

    // models = barModel.upgradeMfCalcForceDims({ models: models });

    // models = barModel.makeFieldsDoubleDeps({ models: models });
    // models = barModel.checkFieldsDoubleDeps({ models: models });
    // models = barModel.afterDoubleCheckFieldsDeps({ models: models });
    // // substitute double calc with restart #add doubles to 'force_dims'
    // models = barModel.makeFieldsDoubleDepsAfterSingles({ models: models });

    // models = barModel.checkModelFiltersFromField({ models: models });

    // // ApFilter
    // models = barFilter.checkVMDFilterDefaults({
    //   entities: models,
    //   weekStart: item.weekStart,
    //   connection: item.connection
    // });

    // // ApJoin
    // models = barJoin.checkJoinUnknownParameters({ models: models });
    // models = barJoin.checkJoinType({ models: models });

    // models = barJoin.upgradeJoinForceDims({ models: models });

    // models = barJoin.checkSqlOnExist({ models: models });
    // models = barJoin.checkCharsInSqlOnRefs({ models: models });
    // models = barJoin.makeJoinsDoubleDeps({ models: models });
    // models = barJoin.checkJoinsDoubleDeps({ models: models });

    // models = barJoin.checkSqlOnSingleRefs({ models: models });
    // models = barJoin.substituteSqlOnSingleRefs({ models: models });
    // // and joins_prepared_deps
    // models = barJoin.makeJoinsDoubleDepsAfterSingles({ models: models });

    // // ApJoinSqlWhere
    // models = barJoinSqlWhere.checkCharsInRefs({ models: models });
    // models = barJoinSqlWhere.makeDoubleDeps({ models: models });
    // models = barJoinSqlWhere.checkDoubleDeps({ models: models });

    // models = barJoinSqlWhere.checkSingleRefs({ models: models });
    // models = barJoinSqlWhere.substituteSingleRefs({ models: models });
    // models = barJoinSqlWhere.updateJoinsDoubleDepsAfterSingles({
    //   models: models
    // });
    // models = barJoinSqlWhere.checkApplyFilter({ models: models });

    // // Back to ApModel
    // models = barModel.checkJoinsCyclesAndToposort({ models: models });
    // models = barModel.checkAlwaysJoin({ models: models });

    // // ApModelSqlAlwaysWhere
    // models = barModelSqlAlwaysWhere.checkCharsInRefs({ models: models });
    // models = barModelSqlAlwaysWhere.makeDoubleDeps({ models: models });
    // models = barModelSqlAlwaysWhere.checkDoubleDeps({ models: models });

    // models = barModelSqlAlwaysWhere.checkSingleRefs({ models: models });
    // models = barModelSqlAlwaysWhere.substituteSingleRefs({ models: models });
    // models = barModelSqlAlwaysWhere.makeDoubleDepsAfterSingles({
    //   models: models
    // });
    // models = barModelSqlAlwaysWhere.checkApplyFilter({ models: models });

    // // ApModelSqlAlwaysWhereCalc
    // models = barModelSqlAlwaysWhereCalc.checkCharsInRefs({ models: models });
    // models = barModelSqlAlwaysWhereCalc.makeDoubleDeps({ models: models });
    // models = barModelSqlAlwaysWhereCalc.checkDoubleDeps({ models: models });

    // models = barModelSqlAlwaysWhereCalc.checkSingleRefs({ models: models });
    // models = barModelSqlAlwaysWhereCalc.substituteRefs({ models: models });
    // models = barModelSqlAlwaysWhereCalc.checkApplyFilter({ models: models });

    // // ApDashboard
    // dashboards = barDashboard.checkDashboardAccessUsers({
    //   dashboards: dashboards
    // });

    // // ApField
    // dashboards = barField.checkFieldsIsArray({ entities: dashboards }); //   *dash_prepare_fields_ary
    // dashboards = barField.checkFieldIsObject({ entities: dashboards }); //   *dash_prepare_fields_ary
    // // *dash_prepare_fields_ary && *dash_check_field_declaration
    // dashboards = barField.checkFieldDeclaration({ entities: dashboards });

    // // ApDashboard
    // // *dash_check_field_declaration
    // dashboards = barDashboard.checkFieldIsFilter({ dashboards: dashboards });

    // // ApField
    // // missed in old blockml
    // dashboards = barField.checkSqlExist({ entities: dashboards });
    // // *dash_prepare_fields_keys && *dash_make_fields
    // dashboards = barField.checkFieldNameDuplicates({ entities: dashboards });
    // // *dash_check_field_unknown_parameters
    // dashboards = barField.checkFieldUnknownParameters({ entities: dashboards });
    // // *dash_set_implicit_label
    // dashboards = barField.setImplicitLabel({ entities: dashboards });
    // // *dash_check_and_set_implicit_results
    // dashboards = barField.checkAndSetImplicitResults({ entities: dashboards });
    // dashboards = barField.checkAndSetImplicitFormatNumber({
    //   entities: dashboards
    // });

    // // ApDashboard
    // // *dash_check_and_set_implicit_results
    // dashboards = barDashboard.checkDashboardFiltersFromField({
    //   dashboards: dashboards,
    //   models: models
    // });
    // // *make_reports
    // dashboards = barDashboard.checkReportsIsArray({ dashboards: dashboards });

    // // ApFilter
    // dashboards = barFilter.checkVMDFilterDefaults({
    //   entities: dashboards,
    //   weekStart: item.weekStart,
    //   connection: item.connection
    // });

    // // ApReport
    // dashboards = barReport.checkReportIsObject({ dashboards: dashboards });
    // dashboards = barReport.checkReportUnknownParameters({
    //   dashboards: dashboards
    // });
    // // *check_reports *check_select_exists
    // dashboards = barReport.checkReportsTitleModelSelect({
    //   dashboards: dashboards,
    //   models: models
    // });
    // dashboards = barReport.checkSelectElements({
    //   dashboards: dashboards,
    //   models: models
    // });
    // dashboards = barReport.checkSelectForceDims({ dashboards: dashboards });
    // dashboards = barReport.checkSorts({ dashboards: dashboards });

    // dashboards = barReport.checkTimezone({ dashboards: dashboards });
    // dashboards = barReport.checkLimit({ dashboards: dashboards });

    // dashboards = barReport.processListenFilters({
    //   dashboards: dashboards,
    //   models: models
    // });
    // dashboards = barReport.processDefaultFilters({
    //   dashboards: dashboards,
    //   models: models
    // });
    // dashboards = barReport.checkReportDefaultFilters({
    //   dashboards: dashboards,
    //   models: models,
    //   weekStart: item.weekStart,
    //   connection: item.connection
    // });

    // dashboards = barReport.combineReportFilters({ dashboards: dashboards });
    // dashboards = barReport.checkFiltersForceDims({
    //   dashboards: dashboards,
    //   models: models
    // });
    // dashboards = barReport.checkWhereCalcForceDims({
    //   dashboards: dashboards,
    //   models: models
    // });

    // dashboards = await barReport.fetchBqViews({
    //   dashboards: dashboards,
    //   models: models,
    //   udfs: udfs,
    //   weekStart: item.weekStart,
    //   connection: item.connection,
    //   bqProject: item.bqProject,
    //   projectId: item.projectId,
    //   structId: item.structId
    // });

    // // ApChart
    // dashboards = barChart.checkChartType({ dashboards: dashboards });
    // dashboards = barChart.checkChartData({ dashboards: dashboards });
    // dashboards = barChart.checkChartDataParameters({ dashboards: dashboards });
    // dashboards = barChart.checkChartAxisParameters({ dashboards: dashboards });
    // dashboards = barChart.checkChartOptionsParameters({
    //   dashboards: dashboards
    // });
    // dashboards = barChart.checkChartTileParameters({ dashboards: dashboards });

    // let errors = ErrorsCollector.getErrors();

    return {
      errors: errors,
      udfs: udfs,
      views: views,
      models: models,
      dashboards: dashboards,
      visualizations: visualizations
      // pdts: pdts,
      // pdts_sorted: pdtsSorted
    };
  }
}
