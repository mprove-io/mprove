import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { getMproveConfigFile } from '#blockml/controllers/rebuild-struct/get-mprove-config-file/get-mprove-config-file';
import { wrapCharts } from '#blockml/controllers/rebuild-struct/wrap-charts/wrap-charts';
import { wrapDashboards } from '#blockml/controllers/rebuild-struct/wrap-dashboards/wrap-dashboards';
import { wrapErrors } from '#blockml/controllers/rebuild-struct/wrap-errors/wrap-errors';
import { wrapReports } from '#blockml/controllers/rebuild-struct/wrap-reports/wrap-reports';
import { collectFiles } from '#blockml/functions/collect-files/collect-files';
import { BlockmlTabService } from '#blockml/services/blockml-tab/blockml-tab.service';
import { PresetsService } from '#blockml/services/presets/presets.service';
import type { BlockmlResultForOperation } from '#blockml/types/blockml-result-for-operation';
import type { RebuildStructPrep } from '#blockml/types/rebuild-struct-prep';
import { ServerError } from '#common/classes/server-error/server-error';
import { MPROVE_CONFIG_FILENAME } from '#common/constants/top';

import { isDefined } from '#common/functions/is-defined/is-defined';
import type { BaseConnection } from '#common/types/backend/parts/base-connection';
import type { Ev } from '#common/types/backend/parts/ev';
import type { SelectedGiven } from '#common/types/backend/parts/given/selected-given';
import type { MproveConfig } from '#common/types/backend/parts/mprove-config';
import type { ProjectConnection } from '#common/types/backend/parts/project-connection';
import type { RebuildStructFromDirError } from '#common/types/blockml/function-errors/rebuild-struct-from-dir-error';
import type { RebuildStructStatelessError } from '#common/types/blockml/function-errors/rebuild-struct-stateless-error';
import type { BmlFile } from '#common/types/blockml/parts/file/bml-file';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import type { Preset } from '#common/types/blockml/parts/preset';
import type { ToBlockmlRebuildStructOutput } from '#common/types/blockml/routes/rebuild-struct/rebuild-struct-output';
import type { GetMproveDirError } from '#common/types/node-common/function-errors/get-mprove-dir-error';
import type { ConnectionLt } from '#common/types/shared/st-lt/connections/connection-lt';
import type { ConnectionSt } from '#common/types/shared/st-lt/connections/connection-st';
import { getMproveDir } from '#node-common/functions/get-mprove-dir/get-mprove-dir';
import { rebuildStructStateless } from './rebuild-struct-stateless/rebuild-struct-stateless';

@Injectable()
export class RebuildStructService {
  constructor(
    private blockmlTabService: BlockmlTabService,
    private presetsService: PresetsService,
    private cs: ConfigService<BlockmlConfig>,
    private logger: Logger
  ) {}

  async process(item: {
    projectId: string;
    envId: string;
    evs: Ev[];
    structId: string;
    mproveDir?: string;
    files: BmlFile[];
    baseConnections: BaseConnection[];
    selectedGivens: SelectedGiven[];
    overrideTimezone?: string;
    isUseCache: boolean;
    cachedMproveConfig?: MproveConfig;
    cachedModels: Model[];
    cachedMetrics: ModelMetric[];
  }): Promise<BlockmlResultForOperation<'rebuildStruct'>> {
    let {
      structId,
      projectId,
      files,
      baseConnections,
      envId,
      evs,
      mproveDir,
      overrideTimezone,
      isUseCache,
      cachedMproveConfig,
      cachedModels,
      cachedMetrics,
      selectedGivens
    } = item;

    let projectConnections: ProjectConnection[] = [];

    baseConnections.forEach(baseConnection => {
      let connectionSt: ConnectionSt =
        this.blockmlTabService.decrypt<ConnectionSt>({
          encryptedString: baseConnection.st
        });

      let connectionLt: ConnectionLt =
        this.blockmlTabService.decrypt<ConnectionLt>({
          encryptedString: baseConnection.lt
        });

      let projectConnection: ProjectConnection = {
        projectId: baseConnection.projectId,
        connectionId: baseConnection.connectionId,
        envId: baseConnection.envId,
        type: baseConnection.type,
        options: connectionSt.options,
        rawSchema: connectionLt.rawSchema
      };

      projectConnections.push(projectConnection);
    });

    let presets: Preset[] = this.presetsService.getPresets();

    let rebuildStructOutput: Result.Result<
      RebuildStructPrep,
      RebuildStructStatelessError
    > = await rebuildStructStateless({
      files: files,
      structId: structId,
      envId: envId,
      evs: evs,
      projectConnections: projectConnections,
      mproveDir: mproveDir,
      overrideTimezone: overrideTimezone,
      projectId: projectId,
      isUseCache: isUseCache,
      cachedMproveConfig: cachedMproveConfig,
      cachedModels: cachedModels,
      cachedMetrics: cachedMetrics,
      selectedGivens: selectedGivens,
      isTest: false,
      presets: presets,
      cs: this.cs,
      logger: this.logger
    });

    if (Result.isFailure(rebuildStructOutput)) {
      return rebuildStructOutput;
    }

    let prep: RebuildStructPrep = rebuildStructOutput.value;

    let apiErrors = wrapErrors({ errors: prep.errors });

    let apiReports = wrapReports({
      projectId: projectId,
      structId: structId,
      reports: prep.reports,
      metrics: prep.metrics,
      models: prep.apiModels,
      formatNumber: prep.mproveConfig.formatNumber,
      currencyPrefix: prep.mproveConfig.currencyPrefix,
      currencySuffix: prep.mproveConfig.currencySuffix
    });

    let { apiDashboards, dashMconfigs, dashQueries } = wrapDashboards({
      structId: structId,
      projectId: projectId,
      apiModels: prep.apiModels,
      stores: prep.stores,
      dashboards: prep.dashboards,
      envId: envId,
      timezone: prep.mproveConfig.defaultTimezone
    });

    let { apiCharts, chartMconfigs, chartQueries } = wrapCharts({
      structId: structId,
      projectId: projectId,
      apiModels: prep.apiModels,
      stores: prep.stores,
      charts: prep.charts,
      envId: envId,
      timezone: prep.mproveConfig.defaultTimezone
    });

    let queries = [...dashQueries, ...chartQueries];

    let mconfigs = [...dashMconfigs, ...chartMconfigs];

    let output: ToBlockmlRebuildStructOutput = {
      errors: apiErrors,
      models: prep.apiModels,
      dashboards: apiDashboards,
      reports: apiReports,
      charts: apiCharts,
      metrics: prep.metrics,
      presets: prep.presets,
      spaces: prep.spaces,
      mproveExplorer: prep.mproveExplorer,
      mconfigs: mconfigs,
      queries: queries,
      extraSchemas: prep.extraSchemas,
      mproveConfig: prep.mproveConfig
    };

    return Result.succeed(output);
  }

  async rebuildStructFromDirUnwrap(item: {
    traceId: string;
    dir: string;
    structId: string;
    envId: string;
    evs: Ev[];
    projectConnections: ProjectConnection[];
    selectedGivens?: SelectedGiven[];
    overrideTimezone: string;
  }): Promise<RebuildStructPrep> {
    let {
      traceId,
      dir,
      structId,
      envId,
      evs,
      projectConnections,
      selectedGivens,
      overrideTimezone
    } = item;

    let result: Result.Result<RebuildStructPrep, RebuildStructFromDirError> =
      await this.rebuildStructFromDir({
        traceId: traceId,
        dir: dir,
        structId: structId,
        envId: envId,
        evs: evs,
        projectConnections: projectConnections,
        selectedGivens: selectedGivens,
        overrideTimezone: overrideTimezone
      });

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        customData:
          'customData' in result.error ? result.error.customData : undefined
      });
    }

    let prep: RebuildStructPrep = result.value;

    return prep;
  }

  async rebuildStructFromDir(item: {
    traceId: string;
    dir: string;
    structId: string;
    envId: string;
    evs: Ev[];
    projectConnections: ProjectConnection[];
    selectedGivens?: SelectedGiven[];
    overrideTimezone: string;
  }): Result.ResultAsync<RebuildStructPrep, RebuildStructFromDirError> {
    let {
      dir,
      structId,
      envId,
      evs,
      projectConnections,
      selectedGivens,
      overrideTimezone
    } = item;

    let configPath: string = dir + '/' + MPROVE_CONFIG_FILENAME;

    let mproveDirResult: Result.Result<string, GetMproveDirError> =
      await getMproveDir({ dir: dir, configPath: configPath });

    if (Result.isFailure(mproveDirResult)) {
      return mproveDirResult;
    }

    let mproveDir: string = mproveDirResult.value;

    let files: BmlFile[] = [];

    if (isDefined(mproveDir)) {
      files = await collectFiles(
        {
          dir: mproveDir,
          repoDir: dir,
          structId: structId,
          caller: 'RebuildStruct',
          skipLog: false
        },
        this.cs
      );
    }

    files = files.filter(x => x.name !== MPROVE_CONFIG_FILENAME);

    let mproveConfigFile: BmlFile = await getMproveConfigFile(configPath);

    if (isDefined(mproveConfigFile)) {
      files.push(mproveConfigFile);
    }

    let presets: Preset[] = this.presetsService.getPresets();

    let rebuildStructOutput: Result.Result<
      RebuildStructPrep,
      RebuildStructStatelessError
    > = await rebuildStructStateless({
      files: files,
      structId: structId,
      envId: envId,
      evs: evs,
      projectConnections: projectConnections,
      selectedGivens: selectedGivens ?? [],
      mproveDir: mproveDir,
      overrideTimezone: overrideTimezone,
      projectId: undefined,
      isUseCache: false,
      cachedMproveConfig: undefined,
      cachedModels: [],
      cachedMetrics: [],
      isTest: true,
      presets: presets,
      cs: this.cs,
      logger: this.logger
    });

    return rebuildStructOutput;
  }
}
