import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { connectionsTable } from '#backend/drizzle/postgres/tables/connections';
import type { ModelFieldLeafTab } from '#backend/drizzle/postgres/tables/model-field-leafs';
import type { StructTab } from '#backend/drizzle/postgres/tables/structs';
import { buildModelFieldLeafs } from '#backend/functions/blockml/rebuild-struct/build-model-field-leafs/build-model-field-leafs';
import { chartApiToTab } from '#backend/functions/db/charts/chart-api-to-tab/chart-api-to-tab';
import { tabToBaseConnection } from '#backend/functions/db/connections/tab-to-base-connection/tab-to-base-connection';
import { dashboardApiToTab } from '#backend/functions/db/dashboards/dashboard-api-to-tab/dashboard-api-to-tab';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { mconfigApiToTab } from '#backend/functions/db/mconfigs/mconfig-api-to-tab/mconfig-api-to-tab';
import { modelApiToTab } from '#backend/functions/db/models/model-api-to-tab/model-api-to-tab';
import { queryApiToTab } from '#backend/functions/db/queries/query-api-to-tab/query-api-to-tab';
import { processReportRowIds } from '#backend/functions/db/reports/process-report-row-ids/process-report-row-ids';
import { reportApiToTab } from '#backend/functions/db/reports/report-api-to-tab/report-api-to-tab';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { diskFilesToBlockmlFiles } from '#backend/functions/disk-files-to-blockml-files/disk-files-to-blockml-files';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import type { DbService } from '#backend/services/db/db.service';
import type { RpcService } from '#backend/services/rpc/rpc.service';
import type { TabService } from '#backend/services/tab/tab.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { DbConnectionsFindManyError } from '#common/types/backend/function-errors/db/connections/db-connections-find-many-error';
import type { DbErrorToError } from '#common/types/backend/function-errors/db/db-error-to-error';
import type { GetApiEnvsError } from '#common/types/backend/function-errors/get-api-envs-error';
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

export async function rebuildStruct(item: {
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
  db: DbService;
  tabService: TabService;
  rpcService: RpcService;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
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
    cachedMetrics,
    db,
    tabService,
    rpcService,
    cs,
    logger
  } = item;

  let apiEnvsResult: Result.Result<Env[], GetApiEnvsError> = await getApiEnvs({
    db: db,
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
    > = await db.connections.findMany({
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
    tabToBaseConnection({ tabService: tabService, connection: x })
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
  > = await rpcService.sendToBlockml({
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
      cs.get<BackendConfig['mproveReleaseTag']>('mproveReleaseTag'),
    keyTag: undefined,
    serverTs: undefined
  };

  rs.reports.forEach(report => {
    let newRows: Row[] = processReportRowIds({
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
              let modelFieldLeafs: ModelFieldLeafTab[] = buildModelFieldLeafs({
                models: rs.models
              });

              await db.writeUnwrap({
                insert: {
                  structs: [struct],
                  charts: rs.charts.map(x =>
                    chartApiToTab({
                      apiChart: x,
                      chartType: rs.mconfigs.find(
                        mconfig => mconfig.mconfigId === x.tiles[0].mconfigId
                      ).chart.type
                    })
                  ),
                  models: rs.models.map(x =>
                    modelApiToTab({
                      apiModel: x
                    })
                  ),
                  modelFieldLeafs: modelFieldLeafs,
                  reports: rs.reports.map(x =>
                    reportApiToTab({
                      apiReport: x
                    })
                  ),
                  mconfigs: rs.mconfigs.map(x =>
                    mconfigApiToTab({
                      apiMconfig: x
                    })
                  ),
                  dashboards: rs.dashboards.map(x =>
                    dashboardApiToTab({
                      apiDashboard: x
                    })
                  )
                },
                insertOrDoNothing: {
                  queries: rs.queries.map(x =>
                    queryApiToTab({
                      apiQuery: x
                    })
                  )
                },
                retryOptions: { retries: 0 }
              });
            },
            getRetryOption(cs, logger)
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
