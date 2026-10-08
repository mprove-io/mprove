import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ConnectionTab,
  ModelFieldLeafTab,
  StructTab
} from '#backend/drizzle/postgres/schema/_tabs';
import type { ConnectionEnt } from '#backend/drizzle/postgres/schema/connections';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { diskFilesToBlockmlFiles } from '#backend/functions/disk-files-to-blockml-files/disk-files-to-blockml-files';
import { processRowIds } from '#backend/functions/process-row-ids/process-row-ids';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { buildModelFieldLeafs } from '#backend/services/blockml/build-model-field-leafs/build-model-field-leafs';
import { ChartsService } from '#backend/services/db/charts/charts.service';
import { ConnectionsService } from '#backend/services/db/connections/connections.service';
import { DashboardsService } from '#backend/services/db/dashboards/dashboards.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { ReportsService } from '#backend/services/db/reports/reports.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ConnectionEntToTabResultError } from '#common/types/backend/function-errors/connection-ent-to-tab-result-error';
import type { DbErrorToResultError } from '#common/types/backend/function-errors/db-error-to-result-error';
import type { GetApiEnvsResultError } from '#common/types/backend/function-errors/get-api-envs-result-error';
import type { RebuildStructResultError } from '#common/types/backend/function-errors/rebuild-struct-result-error';
import type { SendToBlockmlResultError } from '#common/types/backend/function-errors/send-to-blockml-result-error';
import type { BaseConnection } from '#common/types/backend/parts/base-connection';
import type { Env } from '#common/types/backend/parts/env';
import type { Ev } from '#common/types/backend/parts/ev';
import type { SelectedGiven } from '#common/types/backend/parts/given/selected-given';
import type { MproveConfig } from '#common/types/backend/parts/mprove-config';
import type { Chart } from '#common/types/blockml/parts/chart/chart';
import type { Dashboard } from '#common/types/blockml/parts/dashboard/dashboard';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { Report } from '#common/types/blockml/parts/report/report';
import type { Row } from '#common/types/blockml/parts/report/row/row';
import type { ToBlockmlRebuildStructOutput } from '#common/types/blockml/routes/rebuild-struct/rebuild-struct-output';
import type { ToBlockmlRebuildStructRequest } from '#common/types/blockml/routes/rebuild-struct/rebuild-struct-request';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';

export type RebuildStructResultValue = {
  struct: StructTab;
  models: Model[];
  reports: Report[];
  dashboards: Dashboard[];
  charts: Chart[];
  metrics: ModelMetric[];
  mconfigs: Mconfig[];
  queries: Query[];
};

@Injectable()
export class BlockmlService {
  constructor(
    private rpcService: RpcService,
    private tabService: TabService,
    private envsService: EnvsService,
    private connectionsService: ConnectionsService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private chartsService: ChartsService,
    private reportsService: ReportsService,
    private dashboardsService: DashboardsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async rebuildStruct(item: {
    traceId: string;
    orgId: string;
    projectId: string;
    structId: string;
    repoId: string;
    envId: string;
    diskFiles: DiskCatalogFile[];
    mproveDir: string;
    skipDb?: boolean;
    connections?: ConnectionTab[];
    evs?: Ev[];
    selectedGivens: SelectedGiven[];
    overrideTimezone: string;
    isUseCache?: boolean;
    cachedMproveConfig?: MproveConfig;
    cachedModels?: Model[];
    cachedMetrics?: ModelMetric[];
  }): Promise<RebuildStructResultValue> {
    let result: Result.Result<
      RebuildStructResultValue,
      RebuildStructResultError
    > = await this.rebuildStructResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        displayData:
          result.error.code === 'BACKEND_INVALID_REQUEST'
            ? result.error.displayData
            : undefined,
        originalError:
          result.error.code === 'BACKEND_ERROR_RESPONSE_FROM_BLOCKML' &&
          result.error.originalError
            ? Object.assign(new Error(result.error.originalError.code), {
                displayData:
                  'displayData' in result.error.originalError
                    ? result.error.originalError.displayData
                    : undefined
              })
            : undefined
      });
    }

    let value: RebuildStructResultValue = result.value;

    return value;
  }

  async rebuildStructResult(item: {
    traceId: string;
    orgId: string;
    projectId: string;
    structId: string;
    repoId: string;
    envId: string;
    diskFiles: DiskCatalogFile[];
    mproveDir: string;
    skipDb?: boolean;
    connections?: ConnectionTab[];
    evs?: Ev[];
    selectedGivens: SelectedGiven[];
    overrideTimezone: string;
    isUseCache?: boolean;
    cachedMproveConfig?: MproveConfig;
    cachedModels?: Model[];
    cachedMetrics?: ModelMetric[];
  }): Result.ResultAsync<RebuildStructResultValue, RebuildStructResultError> {
    let {
      traceId,
      structId,
      repoId,
      orgId,
      projectId,
      envId,
      diskFiles,
      mproveDir,
      skipDb,
      connections,
      evs,
      selectedGivens,
      overrideTimezone,
      isUseCache,
      cachedMproveConfig,
      cachedModels,
      cachedMetrics
    } = item;

    let apiEnvsResult: Result.Result<Env[], GetApiEnvsResultError> =
      await this.envsService.getApiEnvsResult({
        projectId: projectId
      });

    if (Result.isFailure(apiEnvsResult)) {
      return apiEnvsResult;
    }

    let apiEnvs: Env[] = apiEnvsResult.value;

    let apiEnv: Env = apiEnvs.find(x => x.envId === envId);

    let connectionsWithFallback: ConnectionTab[] = [];

    if (
      isUndefined(connections) &&
      apiEnv?.envConnectionIdsWithFallback.length > 0
    ) {
      let connectionsWithFallbackEnts: ConnectionEnt[] =
        await this.db.drizzle.query.connectionsTable.findMany({
          where: and(
            eq(connectionsTable.projectId, projectId),
            inArray(
              connectionsTable.connectionId,
              apiEnv.envConnectionIdsWithFallback
            )
          )
        });

      let connectionsResult: Result.Result<
        ConnectionTab[],
        ConnectionEntToTabResultError
      > = Result.sequence(connectionsWithFallbackEnts, connectionEnt =>
        this.tabService.connectionEntToTabResult({
          connectionEnt: connectionEnt
        })
      );

      if (Result.isFailure(connectionsResult)) {
        return connectionsResult;
      }

      connectionsWithFallback = connectionsResult.value;
    }

    let connectionsToUse: ConnectionTab[] = isDefined(connections)
      ? connections
      : connectionsWithFallback;

    let baseConnections: BaseConnection[] = connectionsToUse.map(x =>
      this.connectionsService.tabToBaseConnection({ connection: x })
    );

    let toBlockmlRebuildStructRequest: ToBlockmlRebuildStructRequest = {
      operation: 'rebuildStruct',
      traceId: traceId,
      input: {
        structId: structId,
        projectId: projectId,
        mproveDir: mproveDir,
        files: diskFilesToBlockmlFiles(diskFiles),
        envId: envId,
        evs: isDefined(evs) ? evs : apiEnv.evsWithFallback,
        baseConnections: baseConnections,
        selectedGivens: selectedGivens,
        overrideTimezone: overrideTimezone,
        isUseCache: !!isUseCache,
        cachedMproveConfig: cachedMproveConfig,
        cachedModels: cachedModels ?? [],
        cachedMetrics: cachedMetrics ?? []
      }
    };

    let rpcResult: Result.Result<
      ToBlockmlRebuildStructOutput,
      SendToBlockmlResultError
    > = await this.rpcService.sendToBlockmlResult({
      request: toBlockmlRebuildStructRequest,
      orgId: orgId,
      repoId: repoId
    });

    if (Result.isFailure(rpcResult)) {
      return rpcResult;
    }

    let rs: ToBlockmlRebuildStructOutput = rpcResult.value;

    let struct: StructTab = {
      projectId: projectId,
      structId: structId,
      extraSchemas: rs.extraSchemas,
      mproveConfig: rs.mproveConfig,
      errors: rs.errors,
      modelFilePaths: [...new Set(rs.models.map(x => x.filePath))],
      metrics: rs.metrics,
      presets: rs.presets,
      spaces: rs.spaces,
      mproveExplorer: rs.mproveExplorer,
      mproveVersion:
        this.cs.get<BackendConfig['mproveReleaseTag']>('mproveReleaseTag'),
      keyTag: undefined,
      serverTs: undefined
    };

    rs.reports.forEach(report => {
      let newRows: Row[] = processRowIds({
        rows: report.rows,
        targetRowIds: report.rows.map(r => r.rowId)
      });

      report.rows = newRows;
    });

    if (isUndefined(skipDb) || skipDb === false) {
      let persistence: Result.Result<void, DbErrorToResultError> =
        await dbErrorToResult({
          action: async () => {
            await retry(
              async () => {
                let modelFieldLeafs: ModelFieldLeafTab[] = buildModelFieldLeafs(
                  {
                    models: rs.models
                  }
                );

                await this.db.drizzle.transaction(async tx => {
                  await this.db.packer.write({
                    tx: tx,
                    insert: {
                      structs: [struct],
                      charts: rs.charts.map(x =>
                        this.chartsService.apiToTab({
                          apiChart: x,
                          chartType: rs.mconfigs.find(
                            mconfig =>
                              mconfig.mconfigId === x.tiles[0].mconfigId
                          ).chart.type
                        })
                      ),
                      models: rs.models.map(x =>
                        this.modelsService.apiToTab({ apiModel: x })
                      ),
                      modelFieldLeafs: modelFieldLeafs,
                      reports: rs.reports.map(x =>
                        this.reportsService.apiToTab({ apiReport: x })
                      ),
                      mconfigs: rs.mconfigs.map(x =>
                        this.mconfigsService.apiToTab({ apiMconfig: x })
                      ),
                      dashboards: rs.dashboards.map(x =>
                        this.dashboardsService.apiToTab({ apiDashboard: x })
                      )
                    },
                    insertOrDoNothing: {
                      queries: rs.queries.map(x =>
                        this.queriesService.apiToTab({ apiQuery: x })
                      )
                    }
                  });
                });
              },
              getRetryOption(this.cs, this.logger)
            );
          }
        });

      if (Result.isFailure(persistence)) {
        return persistence;
      }
    }

    let value: RebuildStructResultValue = {
      struct: struct,
      models: rs.models,
      reports: rs.reports,
      dashboards: rs.dashboards,
      charts: rs.charts,
      metrics: rs.metrics,
      mconfigs: rs.mconfigs,
      queries: rs.queries
    };

    return Result.succeed(value);
  }
}
