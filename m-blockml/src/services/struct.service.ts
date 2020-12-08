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

    dashboards = barBuilder.buildField({
      entities: dashboards,
      weekStart: item.weekStart,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildDashboardField
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

    models = barBuilder.buildSqlAlwaysWhereCalc({
      models: models,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildSqlAlwaysWhereCalc
    });

    dashboards = barBuilder.buildDashboard({
      dashboards: dashboards,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildDashboard
    });

    dashboards = await barBuilder.buildReport({
      dashboards: dashboards,
      models: models,
      udfs: udfs,
      weekStart: item.weekStart,
      projectId: item.projectId,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildReport
    });

    dashboards = barBuilder.buildChart({
      dashboards: dashboards,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildChart
    });

    // TODO: Visualizations

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
