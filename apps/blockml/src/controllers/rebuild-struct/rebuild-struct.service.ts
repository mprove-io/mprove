import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { barBuilder } from '~blockml/barrels/bar-builder';
import { barSpecial } from '~blockml/barrels/bar-special';
import { barWrapper } from '~blockml/barrels/bar-wrapper';
import { barYaml } from '~blockml/barrels/bar-yaml';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';
import { getMproveConfigFile } from '~blockml/functions/get-mprove-config-file';
import { BmError } from '~blockml/models/bm-error';
import { RabbitService } from '~blockml/services/rabbit.service';

@Injectable()
export class RebuildStructService {
  constructor(
    private rabbitService: RabbitService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  async rebuild(request: any) {
    if (
      request.info?.name !==
      apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BLOCKML_WRONG_REQUEST_INFO_NAME
      });
    }

    let reqValid = nodeCommon.transformValidSync({
      classType: apiToBlockml.ToBlockmlRebuildStructRequest,
      object: request,
      errorMessage: common.ErEnum.BLOCKML_WRONG_REQUEST_PARAMS,
      logIsJson:
        this.cs.get<interfaces.Config['blockmlLogIsJson']>('blockmlLogIsJson'),
      logger: this.logger
    });

    let {
      structId,
      orgId,
      projectId,
      files,
      connections,
      envId,
      evs,
      mproveDir
    } = reqValid.payload;

    let {
      errors,
      apis,
      dashboards,
      metrics,
      models,
      reps,
      udfsDict,
      views,
      vizs,
      mproveDirValue,
      weekStart,
      allowTimezones,
      defaultTimezone,
      formatNumber,
      currencyPrefix,
      currencySuffix
    } = await this.rebuildStructStateless({
      traceId: reqValid.info.traceId,
      files: files,
      structId: structId,
      envId: envId,
      evs: evs,
      connections: connections,
      mproveDir: mproveDir
    });

    let apiErrors = barWrapper.wrapErrors({ errors: errors });

    let apiViews = barWrapper.wrapViews({ views: views });

    let apiModels = barWrapper.wrapModels({
      structId: structId,
      models: models
    });

    let apiReps = barWrapper.wrapReps({
      projectId: projectId,
      structId: structId,
      reps: reps,
      metrics: metrics,
      models: apiModels,
      formatNumber: formatNumber,
      currencyPrefix: currencyPrefix,
      currencySuffix: currencySuffix
    });

    let apiApis = barWrapper.wrapApis({ structId: structId, apis: apis });

    let { apiDashboards, dashMconfigs, dashQueries } =
      barWrapper.wrapDashboards({
        structId: structId,
        orgId: orgId,
        projectId: projectId,
        models: models,
        dashboards: dashboards,
        envId: envId
      });

    let { apiVizs, vizMconfigs, vizQueries } = barWrapper.wrapVizs({
      structId: structId,
      orgId: orgId,
      projectId: projectId,
      models: models,
      vizs: vizs,
      envId: envId
    });

    let queries = [...dashQueries, ...vizQueries];
    let mconfigs = [...dashMconfigs, ...vizMconfigs];

    let payload: apiToBlockml.ToBlockmlRebuildStructResponsePayload = {
      errors: apiErrors,
      udfsDict: udfsDict,
      views: apiViews,
      models: apiModels,
      dashboards: apiDashboards,
      apis: apiApis,
      reps: apiReps,
      vizs: apiVizs,
      metrics: metrics,
      mconfigs: mconfigs,
      queries: queries,
      mproveDirValue: mproveDirValue,
      weekStart: weekStart,
      allowTimezones: allowTimezones,
      defaultTimezone: defaultTimezone,
      formatNumber: formatNumber,
      currencyPrefix: currencyPrefix,
      currencySuffix: currencySuffix
    };

    return payload;
  }

  async rebuildStruct(item: {
    traceId: string;
    dir: string;
    structId: string;
    envId: string;
    evs: common.Ev[];
    connections: common.ProjectConnection[];
  }) {
    let configPath = item.dir + '/' + common.MPROVE_CONFIG_FILENAME;

    let mproveDir = await nodeCommon.getMproveDir({
      dir: item.dir,
      configPath: configPath
    });

    let files: common.BmlFile[] = [];

    if (common.isDefined(mproveDir)) {
      files = await barYaml.collectFiles(
        {
          dir: mproveDir,
          structId: item.structId,
          caller: common.CallerEnum.RebuildStruct
        },
        this.cs
      );
    }

    files = files.filter(x => x.name !== common.MPROVE_CONFIG_FILENAME);

    let mproveConfigFile = await getMproveConfigFile(configPath);

    if (common.isDefined(mproveConfigFile)) {
      files.push(mproveConfigFile);
    }

    return await this.rebuildStructStateless({
      traceId: item.traceId,
      files: files,
      structId: item.structId,
      envId: item.envId,
      evs: item.evs,
      connections: item.connections,
      mproveDir: mproveDir
    });
  }

  async rebuildStructStateless(item: {
    traceId: string;
    files: common.BmlFile[];
    structId: string;
    envId: string;
    evs: common.Ev[];
    connections: common.ProjectConnection[];
    mproveDir: string;
  }) {
    //
    let errors: BmError[] = [];
    let apis: common.FileApi[];
    let dashboards: common.FileDashboard[];
    let metrics: common.FileMetric[];
    let models: common.FileModel[];
    let reps: common.FileRep[];
    let udfs: common.FileUdf[];
    let views: common.FileView[];
    let vizs: common.FileVis[];
    let projectConfig: common.FileProjectConf;

    let yamlBuildItem = barBuilder.buildYaml(
      {
        files: item.files,
        connections: item.connections,
        mproveDir: item.mproveDir,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildYaml
      },
      this.cs
    );
    apis = yamlBuildItem.apis;
    dashboards = yamlBuildItem.dashboards;
    metrics = yamlBuildItem.metrics;
    models = yamlBuildItem.models;
    reps = yamlBuildItem.reps;
    udfs = yamlBuildItem.udfs;
    views = yamlBuildItem.views;
    vizs = yamlBuildItem.vizs;
    projectConfig = yamlBuildItem.projectConfig;

    if (common.isUndefined(projectConfig)) {
      return {
        errors: errors,
        apis: [],
        dashboards: [],
        metrics: [],
        models: [],
        reps: [],
        udfsDict: {},
        views: [],
        vizs: [],
        mproveDirValue: undefined,
        weekStart: constants.PROJECT_CONFIG_WEEK_START,
        allowTimezones: helper.toBooleanFromLowercaseString(
          constants.PROJECT_CONFIG_ALLOW_TIMEZONES
        ),
        defaultTimezone: constants.PROJECT_CONFIG_DEFAULT_TIMEZONE,
        currencyPrefix: constants.PROJECT_CONFIG_CURRENCY_PREFIX,
        currencySuffix: constants.PROJECT_CONFIG_CURRENCY_SUFFIX,
        formatNumber: constants.PROJECT_CONFIG_FORMAT_NUMBER
      };
    }

    views = barBuilder.buildField(
      {
        entities: views,
        projectConfig: projectConfig,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildViewField
      },
      this.cs
    );

    models = barBuilder.buildField(
      {
        entities: models,
        projectConfig: projectConfig,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildModelField
      },
      this.cs
    );

    dashboards = barBuilder.buildField(
      {
        entities: dashboards,
        projectConfig: projectConfig,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildDashboardField
      },
      this.cs
    );

    let udfsDict: common.UdfsDict = barBuilder.buildUdf(
      {
        udfs: udfs,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildUdf
      },
      this.cs
    );

    views = barBuilder.buildView(
      {
        views: views,
        udfs: udfs,
        udfsDict: udfsDict,
        weekStart: projectConfig.week_start,
        structId: item.structId,
        envId: item.envId,
        evs: item.evs,
        errors: errors,
        caller: common.CallerEnum.BuildView
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
        caller: common.CallerEnum.BuildModel
      },
      this.cs
    );

    models = barBuilder.buildJoin(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildJoin
      },
      this.cs
    );

    models = barBuilder.buildJoinSqlOn(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildJoinSqlOn
      },
      this.cs
    );

    models = barBuilder.buildJoinSqlWhere(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildJoinSqlWhere
      },
      this.cs
    );

    models = barBuilder.buildSortJoins(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildSortJoins
      },
      this.cs
    );

    models = barBuilder.buildSqlAlwaysWhere(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildSqlAlwaysWhere
      },
      this.cs
    );

    models = barBuilder.buildSqlAlwaysWhereCalc(
      {
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildSqlAlwaysWhereCalc
      },
      this.cs
    );

    let buildModelMetricResult = barBuilder.buildModelMetric(
      {
        metrics: metrics,
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildModelMetric
      },
      this.cs
    );

    models = buildModelMetricResult.models;
    let commonMetrics = buildModelMetricResult.metrics;

    dashboards = barBuilder.buildDashboard(
      {
        dashboards: dashboards,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildDashboard
      },
      this.cs
    );

    vizs = barBuilder.buildViz(
      {
        vizs: vizs,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildViz
      },
      this.cs
    );

    dashboards = await barBuilder.buildTile(
      {
        traceId: item.traceId,

        entities: dashboards,
        models: models,
        udfsDict: udfsDict,
        weekStart: projectConfig.week_start,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildDashboardTile
      },
      this.cs,
      this.rabbitService
    );

    vizs = await barBuilder.buildTile(
      {
        traceId: item.traceId,
        entities: vizs,
        models: models,
        udfsDict: udfsDict,
        weekStart: projectConfig.week_start,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildVizTile
      },
      this.cs,
      this.rabbitService
    );

    dashboards = barBuilder.buildChart(
      {
        entities: dashboards,
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildDashboardChart
      },
      this.cs
    );

    vizs = barBuilder.buildChart(
      {
        entities: vizs,
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildVizChart
      },
      this.cs
    );

    reps = barBuilder.buildRep(
      {
        reps: reps,
        metrics: commonMetrics,
        models: models,
        structId: item.structId,
        errors: errors,
        caller: common.CallerEnum.BuildRep
      },
      this.cs
    );

    barSpecial.logStruct(
      {
        errors: errors,
        udfsDict: udfsDict,
        apis: apis,
        views: views,
        models: models,
        metrics: commonMetrics,
        dashboards: dashboards,
        reps: reps,
        vizs: vizs,
        structId: item.structId,
        caller: common.CallerEnum.RebuildStruct
      },
      this.cs
    );

    return {
      errors: errors,
      apis: apis,
      dashboards: dashboards,
      metrics: commonMetrics,
      models: models,
      udfsDict: udfsDict,
      reps: reps,
      views: views,
      vizs: vizs,
      mproveDirValue: projectConfig.mprove_dir,
      weekStart: projectConfig.week_start,
      allowTimezones: helper.toBooleanFromLowercaseString(
        projectConfig.allow_timezones
      ),
      defaultTimezone: projectConfig.default_timezone,
      formatNumber: projectConfig.format_number,
      currencyPrefix: projectConfig.currency_prefix,
      currencySuffix: projectConfig.currency_suffix
    };
  }
}
