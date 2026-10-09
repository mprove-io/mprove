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
import type { RebuildStructPrep } from '#blockml/types/rebuild-struct-prep';
import { ServerError } from '#common/classes/server-error/server-error';
import { MPROVE_CONFIG_FILENAME } from '#common/constants/top';

import { isDefined } from '#common/functions/is-defined/is-defined';
import type { BaseConnection } from '#common/types/backend/parts/base-connection';
import type { Ev } from '#common/types/backend/parts/ev';
import type { SelectedGiven } from '#common/types/backend/parts/given/selected-given';
import type { MproveConfig } from '#common/types/backend/parts/mprove-config';
import type { ProjectConnection } from '#common/types/backend/parts/project-connection';
import type { BlockmlInternalError } from '#common/types/blockml/errors/blockml-internal-error';
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
  }): Promise<
    Result.Result<ToBlockmlRebuildStructOutput, BlockmlInternalError>
  > {
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

    let rebuildResult = await Result.try({
      try: async (): Promise<ToBlockmlRebuildStructOutput> => {
        let projectConnections: ProjectConnection[] = [];

        baseConnections.forEach(baseConnection => {
          let connectionSt = this.blockmlTabService.decrypt<ConnectionSt>({
            encryptedString: baseConnection.st
          });

          let connectionLt = this.blockmlTabService.decrypt<ConnectionLt>({
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

        let prep: RebuildStructPrep = await Result.unwrap(
          rebuildStructStateless({
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
          })
        );

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

        return output;
      },
      catch: (error): BlockmlInternalError => {
        this.logger.error(error);

        return { code: 'BLOCKML_INTERNAL' };
      }
    });

    return rebuildResult;
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
  }): Promise<RebuildStructPrep> {
    let configPath = item.dir + '/' + MPROVE_CONFIG_FILENAME;

    let mproveDir = await Result.unwrap(
      Result.pipe(
        Result.succeed({
          dir: item.dir,
          configPath: configPath
        }),
        Result.andThen(
          (v): Result.ResultAsync<string, GetMproveDirError> =>
            getMproveDir({ dir: v.dir, configPath: v.configPath })
        ),
        Result.mapError(v => new ServerError({ message: v.code }))
      )
    );

    let files: BmlFile[] = [];

    if (isDefined(mproveDir)) {
      files = await collectFiles(
        {
          dir: mproveDir,
          repoDir: item.dir,
          structId: item.structId,
          caller: 'RebuildStruct',
          skipLog: false
        },
        this.cs
      );
    }

    files = files.filter(x => x.name !== MPROVE_CONFIG_FILENAME);

    let mproveConfigFile = await getMproveConfigFile(configPath);

    if (isDefined(mproveConfigFile)) {
      files.push(mproveConfigFile);
    }

    let presets: Preset[] = this.presetsService.getPresets();

    let prep: RebuildStructPrep = await Result.unwrap(
      rebuildStructStateless({
        files: files,
        structId: item.structId,
        envId: item.envId,
        evs: item.evs,
        projectConnections: item.projectConnections,
        selectedGivens: item.selectedGivens ?? [],
        mproveDir: mproveDir,
        overrideTimezone: item.overrideTimezone,
        projectId: undefined,
        isUseCache: false,
        cachedMproveConfig: undefined,
        cachedModels: [],
        cachedMetrics: [],
        isTest: true,
        presets: presets,
        cs: this.cs,
        logger: this.logger
      })
    );

    return prep;
  }
}
