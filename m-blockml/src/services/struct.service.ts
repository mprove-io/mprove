import { api } from '../barrels/api';
import { enums } from '../barrels/enums';
import { Injectable } from '@nestjs/common';
import { interfaces } from '../barrels/interfaces';
import { BmError } from '../models/bm-error';
import { barYaml } from '../barrels/bar-yaml';
import { barStruct } from '../barrels/bar-struct';

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
      structId: item.structId,
      caller: enums.CallerEnum.RebuildStruct
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
    //
    let errors: BmError[] = [];
    let udfs: interfaces.Udf[];
    let views: interfaces.View[];
    let models: interfaces.Model[];
    let dashboards: interfaces.Dashboard[];
    let visualizations: interfaces.Visualization[];

    let yamlBuildItem = barStruct.yamlBuild({
      files: item.files,
      projectId: item.projectId,
      weekStart: item.weekStart,
      connections: item.connections,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.YamlBuild
    });
    udfs = yamlBuildItem.udfs;
    views = yamlBuildItem.views;
    models = yamlBuildItem.models;
    dashboards = yamlBuildItem.dashboards;
    visualizations = yamlBuildItem.visualizations;

    views = barStruct.fieldBuild({
      entities: views,
      weekStart: item.weekStart,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.FieldBuildViews
    });

    models = barStruct.fieldBuild({
      entities: models,
      weekStart: item.weekStart,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.FieldBuildModels
    });

    let udfsDict: interfaces.UdfsDict = barStruct.udfBuild({
      udfs: udfs,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.UdfBuild
    });

    views = barStruct.viewBuild({
      views: views,
      udfs: udfs,
      udfsDict: udfsDict,
      weekStart: item.weekStart,
      projectId: item.projectId,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.ViewBuild
    });

    models = barStruct.modelBuild({
      models: models,
      views: views,
      udfs: udfs,
      weekStart: item.weekStart,
      projectId: item.projectId,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.ModelBuild
    });

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

    barStruct.logStruct({
      errors: errors,
      udfs: udfs,
      views: views,
      models: models,
      dashboards: dashboards,
      visualizations: visualizations,
      structId: item.structId,
      caller: enums.CallerEnum.RebuildStruct
    });

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
