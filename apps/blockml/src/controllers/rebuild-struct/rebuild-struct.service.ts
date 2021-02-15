import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { barBuilder } from '~blockml/barrels/bar-builder';
import { barSpecial } from '~blockml/barrels/bar-special';
import { barWrapper } from '~blockml/barrels/bar-wrapper';
import { barYaml } from '~blockml/barrels/bar-yaml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { RabbitService } from '~blockml/services/rabbit.service';

@Injectable()
export class RebuildStructService {
  constructor(
    private rabbitService: RabbitService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  async rebuild(request: any) {
    if (
      request.info?.name !==
      apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct
    ) {
      throw new common.ServerError({
        message: apiToBlockml.ErEnum.BLOCKML_WRONG_REQUEST_INFO_NAME
      });
    }

    let reqValid = await common.transformValid({
      classType: apiToBlockml.ToBlockmlRebuildStructRequest,
      object: request,
      errorMessage: apiToBlockml.ErEnum.BLOCKML_WRONG_REQUEST_PARAMS
    });

    let {
      structId,
      orgId,
      projectId,
      weekStart,
      files,
      connections
    } = reqValid.payload;

    let {
      errors,
      udfsDict,
      views,
      models,
      dashboards,
      vizs
    } = await this.rebuildStructStateless({
      traceId: reqValid.info.traceId,
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
      orgId: orgId,
      projectId: projectId,
      models: models,
      dashboards: dashboards
    });

    let { apiVizs, vizMconfigs, vizQueries } = barWrapper.wrapVizs({
      structId: structId,
      orgId: orgId,
      projectId: projectId,
      models: models,
      vizs: vizs
    });

    let queries = [...dashQueries, ...vizQueries];
    let mconfigs = [...dashMconfigs, ...vizMconfigs];

    let payload: apiToBlockml.ToBlockmlRebuildStructResponsePayload = {
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
    traceId: string;
    dir: string;
    structId: string;
    weekStart: common.ProjectWeekStartEnum;
    connections: common.ProjectConnection[];
  }) {
    let files: common.BmlFile[] = await barYaml.collectFiles(
      {
        dir: item.dir,
        structId: item.structId,
        caller: enums.CallerEnum.RebuildStruct
      },
      this.cs
    );

    return await this.rebuildStructStateless({
      traceId: item.traceId,
      files: files,
      structId: item.structId,
      weekStart: item.weekStart,
      connections: item.connections
    });
  }

  async rebuildStructStateless(item: {
    traceId: string;
    files: common.BmlFile[];
    structId: string;
    weekStart: common.ProjectWeekStartEnum;
    connections: common.ProjectConnection[];
  }) {
    //
    let errors: BmError[] = [];
    let udfs: interfaces.Udf[];
    let views: interfaces.View[];
    let models: interfaces.Model[];
    let dashboards: interfaces.Dashboard[];
    let vizs: interfaces.Viz[];

    let yamlBuildItem = barBuilder.buildYaml(
      {
        files: item.files,
        weekStart: item.weekStart,
        connections: item.connections,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildYaml
      },
      this.cs
    );
    udfs = yamlBuildItem.udfs;
    views = yamlBuildItem.views;
    models = yamlBuildItem.models;
    dashboards = yamlBuildItem.dashboards;
    vizs = yamlBuildItem.vizs;

    views = barBuilder.buildField(
      {
        entities: views,
        weekStart: item.weekStart,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildViewField
      },
      this.cs
    );

    models = barBuilder.buildField(
      {
        entities: models,
        weekStart: item.weekStart,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildModelField
      },
      this.cs
    );

    dashboards = barBuilder.buildField(
      {
        entities: dashboards,
        weekStart: item.weekStart,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildDashboardField
      },
      this.cs
    );

    let udfsDict: common.UdfsDict = barBuilder.buildUdf(
      {
        udfs: udfs,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildUdf
      },
      this.cs
    );

    views = barBuilder.buildView(
      {
        views: views,
        udfs: udfs,
        udfsDict: udfsDict,
        weekStart: item.weekStart,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildView
      },
      this.cs
    );

    models = barBuilder.buildModel(
      {
        models: models,
        views: views,
        udfs: udfs,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildModel
      },
      this.cs
    );

    models = barBuilder.buildJoin(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildJoin
      },
      this.cs
    );

    models = barBuilder.buildJoinSqlOn(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildJoinSqlOn
      },
      this.cs
    );

    models = barBuilder.buildJoinSqlWhere(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildJoinSqlWhere
      },
      this.cs
    );

    models = barBuilder.buildSortJoins(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildSortJoins
      },
      this.cs
    );

    models = barBuilder.buildSqlAlwaysWhere(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildSqlAlwaysWhere
      },
      this.cs
    );

    models = barBuilder.buildSqlAlwaysWhereCalc(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildSqlAlwaysWhereCalc
      },
      this.cs
    );

    dashboards = barBuilder.buildDashboard(
      {
        dashboards: dashboards,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildDashboard
      },
      this.cs
    );

    vizs = barBuilder.buildViz(
      {
        vizs: vizs,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildViz
      },
      this.cs
    );

    dashboards = await barBuilder.buildReport(
      {
        traceId: item.traceId,

        entities: dashboards,
        models: models,
        udfsDict: udfsDict,
        weekStart: item.weekStart,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildDashboardReport
      },
      this.cs,
      this.rabbitService
    );

    vizs = await barBuilder.buildReport(
      {
        traceId: item.traceId,
        entities: vizs,
        models: models,
        udfsDict: udfsDict,
        weekStart: item.weekStart,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildVizReport
      },
      this.cs,
      this.rabbitService
    );

    dashboards = barBuilder.buildChart(
      {
        entities: dashboards,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildDashboardChart
      },
      this.cs
    );

    vizs = barBuilder.buildChart(
      {
        entities: vizs,
        structId: item.structId,
        errors: errors,
        caller: enums.CallerEnum.BuildVizChart
      },
      this.cs
    );

    barSpecial.logStruct(
      {
        errors: errors,
        udfsDict: udfsDict,
        views: views,
        models: models,
        dashboards: dashboards,
        vizs: vizs,
        structId: item.structId,
        caller: enums.CallerEnum.RebuildStruct
      },
      this.cs
    );

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
