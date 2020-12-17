import { api } from '../barrels/api';
import { enums } from '../barrels/enums';
import { Injectable } from '@nestjs/common';
import { interfaces } from '../barrels/interfaces';
import { BmError } from '../models/bm-error';
import { barYaml } from '../barrels/bar-yaml';
import { barBuilder } from '../barrels/bar-builder';
import { barWrapper } from '../barrels/bar-wrapper';
import { RabbitService } from './rabbit.service';

@Injectable()
export class StructService {
  constructor(private readonly rabbitService: RabbitService) {}

  async wrapStruct(item: {
    structId: string;
    organizationId: string;
    projectId: string;
    files: api.File[];
    weekStart: api.ProjectWeekStartEnum;
    connections: api.ProjectConnection[];
  }) {
    let {
      structId,
      organizationId,
      projectId,
      files,
      weekStart,
      connections
    } = item;

    let {
      errors,
      udfsDict,
      views,
      models,
      dashboards,
      vizs
    } = await this.rebuildStructStateless({
      files: files,
      weekStart: weekStart,
      structId: structId,
      connections: connections
    });

    let apiErrors = barWrapper.wrapErrors({ errors: errors });

    let apiViews = barWrapper.wrapViews({ views: views });

    let apiModels = barWrapper.wrapModels({
      structId: structId,
      models: models
    });

    let {
      apiDashboards,
      dashMconfigs,
      dashQueries
    } = barWrapper.wrapDashboards({
      structId: structId,
      organizationId: organizationId,
      projectId: projectId,
      models: models,
      dashboards: dashboards
    });

    let { apiVizs, vizMconfigs, vizQueries } = barWrapper.wrapVizs({
      structId: structId,
      organizationId: organizationId,
      projectId: projectId,
      models: models,
      vizs: vizs
    });

    let queries = [...dashQueries, ...vizQueries];
    let mconfigs = [...dashMconfigs, ...vizMconfigs];

    let payload: api.ToBlockmlRebuildStructResponsePayload = {
      errors: apiErrors,
      udfsDict: udfsDict,
      views: apiViews,
      models: apiModels,
      dashboards: apiDashboards,
      vizs: apiVizs,
      mconfigs: mconfigs,
      queries: queries
    };

    return payload;
  }

  async rebuildStruct(item: {
    dir: string;
    structId: string;
    weekStart: api.ProjectWeekStartEnum;
    connections: api.ProjectConnection[];
  }) {
    let files: api.File[] = await barYaml.collectFiles({
      dir: item.dir,
      structId: item.structId,
      caller: enums.CallerEnum.RebuildStruct
    });

    return await this.rebuildStructStateless({
      files: files,
      structId: item.structId,
      weekStart: item.weekStart,
      connections: item.connections
    });
  }

  async rebuildStructStateless(item: {
    files: api.File[];
    structId: string;
    weekStart: api.ProjectWeekStartEnum;
    connections: api.ProjectConnection[];
  }) {
    //
    let errors: BmError[] = [];
    let udfs: interfaces.Udf[];
    let views: interfaces.View[];
    let models: interfaces.Model[];
    let dashboards: interfaces.Dashboard[];
    let vizs: interfaces.Viz[];

    let yamlBuildItem = barBuilder.buildYaml({
      files: item.files,
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
    vizs = yamlBuildItem.vizs;

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

    let udfsDict: api.UdfsDict = barBuilder.buildUdf({
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

    vizs = barBuilder.buildViz({
      vizs: vizs,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildViz
    });

    dashboards = await barBuilder.buildReport({
      rabbitService: this.rabbitService,
      entities: dashboards,
      models: models,
      udfsDict: udfsDict,
      weekStart: item.weekStart,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildDashboardReport
    });

    vizs = await barBuilder.buildReport({
      rabbitService: this.rabbitService,
      entities: vizs,
      models: models,
      udfsDict: udfsDict,
      weekStart: item.weekStart,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildVizReport
    });

    dashboards = barBuilder.buildChart({
      entities: dashboards,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildDashboardChart
    });

    vizs = barBuilder.buildChart({
      entities: vizs,
      structId: item.structId,
      errors: errors,
      caller: enums.CallerEnum.BuildVizChart
    });

    barBuilder.logStruct({
      errors: errors,
      udfsDict: udfsDict,
      views: views,
      models: models,
      dashboards: dashboards,
      vizs: vizs,
      structId: item.structId,
      caller: enums.CallerEnum.RebuildStruct
    });

    return {
      errors: errors,
      udfsDict: udfsDict,
      views: views,
      models: models,
      dashboards: dashboards,
      vizs: vizs
    };
  }
}
