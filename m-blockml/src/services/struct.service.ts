import { api } from '../barrels/api';
import { enums } from '../barrels/enums';
import { Injectable } from '@nestjs/common';
import { interfaces } from '../barrels/interfaces';
import { BmError } from '../models/bm-error';
import { barYaml } from '../barrels/bar-yaml';
import { barBuilder } from '../barrels/bar-builder';

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

    let yamlBuildItem = barBuilder.buildYaml({
      files: item.files,
      projectId: item.projectId,
      weekStart: item.weekStart,
      connections: item.connections,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildYaml
    });
    udfs = yamlBuildItem.udfs;
    views = yamlBuildItem.views;
    models = yamlBuildItem.models;
    dashboards = yamlBuildItem.dashboards;
    visualizations = yamlBuildItem.visualizations;

    views = barBuilder.buildField({
      entities: views,
      weekStart: item.weekStart,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildViewField
    });

    models = barBuilder.buildField({
      entities: models,
      weekStart: item.weekStart,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildModelField
    });

    let udfsDict: interfaces.UdfsDict = barBuilder.buildUdf({
      udfs: udfs,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildUdf
    });

    views = barBuilder.buildView({
      views: views,
      udfs: udfs,
      udfsDict: udfsDict,
      weekStart: item.weekStart,
      projectId: item.projectId,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildView
    });

    models = barBuilder.buildModel({
      models: models,
      views: views,
      udfs: udfs,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildModel
    });

    models = barBuilder.buildJoin({
      models: models,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildJoin
    });

    models = barBuilder.buildJoinSqlOn({
      models: models,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildJoinSqlOn
    });

    models = barBuilder.buildJoinSqlWhere({
      models: models,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildJoinSqlWhere
    });

    models = barBuilder.buildSortJoins({
      models: models,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildSortJoins
    });

    models = barBuilder.buildSqlAlwaysWhere({
      models: models,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildSqlAlwaysWhere
    });

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

    barBuilder.logStruct({
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
