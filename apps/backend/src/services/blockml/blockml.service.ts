import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type {
  BridgeTab,
  ConnectionTab,
  ModelFieldLeafTab,
  StructTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { diskFilesToBlockmlFiles } from '#backend/functions/disk-files-to-blockml-files/disk-files-to-blockml-files';
import { processRowIds } from '#backend/functions/process-row-ids/process-row-ids';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { buildModelFieldLeafs } from '#backend/services/blockml/build-model-field-leafs/build-model-field-leafs';
import { ChartsService } from '#backend/services/db/charts/charts.service';
import { ConnectionsService } from '#backend/services/db/connections/connections.service';
import { DashboardsService } from '#backend/services/db/dashboards/dashboards.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { ReportsService } from '#backend/services/db/reports/reports.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { DbConnectionsFindManyError } from '#common/types/backend/function-errors/db/connections/db-connections-find-many-error';
import type { DbErrorToError } from '#common/types/backend/function-errors/db/db-error-to-error';
import type { GetApiEnvsError } from '#common/types/backend/function-errors/get-api-envs-error';
import type { RebuildBranchBridgeError } from '#common/types/backend/function-errors/rebuild-branch-bridge-error';
import type { RebuildBranchBridgesError } from '#common/types/backend/function-errors/rebuild-branch-bridges-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { SendToBlockmlError } from '#common/types/backend/function-errors/send-to-blockml-error';
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

export type RebuildStructOutput = {
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
    private db: DbService
  ) {}

  async rebuildBranchBridges(item: {
    branchBridges: BridgeTab[];
    envId: string;
    traceId: string;
    orgId: string;
    projectId: string;
    repoId: string;
    diskFiles: DiskCatalogFile[];
    mproveDir: string;
  }): Result.ResultAsync<void, RebuildBranchBridgesError> {
    return Result.pipe(
      Result.succeed(item),
      Result.andThrough(v =>
        Result.sequence(
          v.branchBridges,
          (
            bridge: BridgeTab
          ): Result.ResultAsync<void, RebuildBranchBridgeError> =>
            this.rebuildBranchBridge({
              bridge: bridge,
              envId: v.envId,
              traceId: v.traceId,
              orgId: v.orgId,
              projectId: v.projectId,
              repoId: v.repoId,
              diskFiles: v.diskFiles,
              mproveDir: v.mproveDir
            })
        )
      ),
      Result.map((v): void => undefined)
    );
  }

  private async rebuildBranchBridge(item: {
    bridge: BridgeTab;
    envId: string;
    traceId: string;
    orgId: string;
    projectId: string;
    repoId: string;
    diskFiles: DiskCatalogFile[];
    mproveDir: string;
  }): Result.ResultAsync<void, RebuildBranchBridgeError> {
    let { bridge, envId } = item;

    if (bridge.envId !== envId) {
      bridge.structId = EMPTY_STRUCT_ID;
      bridge.needValidate = true;

      return Result.succeed();
    }

    return Result.pipe(
      Result.succeed(item),
      Result.bind('structId', v => Result.succeed(makeId())),
      Result.andThrough(v =>
        this.rebuildStruct({
          traceId: v.traceId,
          orgId: v.orgId,
          projectId: v.projectId,
          repoId: v.repoId,
          structId: v.structId,
          diskFiles: v.diskFiles,
          mproveDir: v.mproveDir,
          envId: v.bridge.envId,
          selectedGivens: [],
          overrideTimezone: undefined
        })
      ),
      Result.map(v => {
        v.bridge.structId = v.structId;
        v.bridge.needValidate = false;

        return v;
      }),
      Result.map((v): void => undefined)
    );
  }

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
  }): Result.ResultAsync<RebuildStructOutput, RebuildStructError> {
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

    let apiEnvsResult: Result.Result<Env[], GetApiEnvsError> =
      await this.envsService.getApiEnvs({
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
      let connectionResult: Result.Result<
        ConnectionTab[],
        DbConnectionsFindManyError
      > = await this.db.connections.findMany({
        where: and(
          eq(connectionsTable.projectId, projectId),
          inArray(
            connectionsTable.connectionId,
            apiEnv.envConnectionIdsWithFallback
          )
        )
      });

      if (Result.isFailure(connectionResult)) {
        return connectionResult;
      }

      connectionsWithFallback = connectionResult.value;
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
      SendToBlockmlError
    > = await this.rpcService.sendToBlockml({
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
      let persistence: Result.Result<void, DbErrorToError> =
        await dbErrorToResult({
          action: async () => {
            await retry(
              async () => {
                let modelFieldLeafs: ModelFieldLeafTab[] = buildModelFieldLeafs(
                  {
                    models: rs.models
                  }
                );

                await this.db.writeUnwrap({
                  insert: {
                    structs: [struct],
                    charts: rs.charts.map(x =>
                      this.chartsService.apiToTab({
                        apiChart: x,
                        chartType: rs.mconfigs.find(
                          mconfig => mconfig.mconfigId === x.tiles[0].mconfigId
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
                  },
                  retryOptions: { retries: 0 }
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

    let value: RebuildStructOutput = {
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
