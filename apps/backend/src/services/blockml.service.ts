import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  ConnectionTab,
  StructTab
} from '~backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { diskFilesToBlockmlFiles } from '~backend/functions/disk-files-to-blockml-files';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { processRowIds } from '~backend/functions/process-row-ids';
import { RabbitBlockmlRoutingEnum } from '~common/enums/rabbit-blockml-routing-keys.enum';
import { ToBlockmlRequestInfoNameEnum } from '~common/enums/to/to-blockml-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { Ev } from '~common/interfaces/backend/ev';
import { MproveConfig } from '~common/interfaces/backend/mprove-config';
import { Model } from '~common/interfaces/blockml/model';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import {
  ToBlockmlRebuildStructRequest,
  ToBlockmlRebuildStructResponse
} from '~common/interfaces/to-blockml/api/to-blockml-rebuild-struct';
import { ChartsService } from './db/charts.service';
import { ConnectionsService } from './db/connections.service';
import { DashboardsService } from './db/dashboards.service';
import { EnvsService } from './db/envs.service';
import { MconfigsService } from './db/mconfigs.service';
import { ModelsService } from './db/models.service';
import { QueriesService } from './db/queries.service';
import { ReportsService } from './db/reports.service';
import { RabbitService } from './rabbit.service';

let retry = require('async-retry');

@Injectable()
export class BlockmlService {
  constructor(
    private rabbitService: RabbitService,
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
    projectId: string;
    structId: string;
    envId: string;
    diskFiles: DiskCatalogFile[];
    mproveDir: string;
    skipDb?: boolean;
    connections?: ConnectionTab[];
    evs?: Ev[];
    overrideTimezone: string;
    isUseCache?: boolean;
    cachedMproveConfig?: MproveConfig;
    cachedModels?: Model[];
    cachedMetrics?: ModelMetric[];
  }) {
    let {
      traceId,
      structId,
      projectId,
      envId,
      diskFiles,
      mproveDir,
      skipDb,
      connections,
      evs,
      overrideTimezone,
      isUseCache,
      cachedMproveConfig,
      cachedModels,
      cachedMetrics
    } = item;

    let apiEnvs = await this.envsService.getApiEnvs({
      projectId: projectId
    });

    let apiEnv = apiEnvs.find(x => x.envId === envId);

    let connectionsWithFallback: ConnectionTab[] = [];

    if (
      isUndefined(connections) &&
      apiEnv?.envConnectionIdsWithFallback.length > 0
    ) {
      connectionsWithFallback = await this.db.drizzle.query.connectionsTable
        .findMany({
          where: and(
            eq(connectionsTable.projectId, projectId),
            inArray(
              connectionsTable.connectionId,
              apiEnv.envConnectionIdsWithFallback
            )
          )
        })
        .then(xs => xs.map(x => this.connectionsService.entToTab(x)));
    }

    let connectionsToUse = isDefined(connections)
      ? connections
      : connectionsWithFallback;

    let baseConnections = connectionsToUse.map(x =>
      this.connectionsService.tabToApiBaseConnection({ connection: x })
    );

    let toBlockmlRebuildStructRequest: ToBlockmlRebuildStructRequest = {
      info: {
        name: ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct,
        traceId: traceId
      },
      payload: {
        structId: structId,
        projectId: projectId,
        mproveDir: mproveDir,
        files: diskFilesToBlockmlFiles(diskFiles),
        envId: envId,
        evs: isDefined(evs) ? evs : apiEnv.evsWithFallback,
        baseConnections: baseConnections,
        overrideTimezone: overrideTimezone,
        isUseCache: !!isUseCache,
        cachedMproveConfig: cachedMproveConfig,
        cachedModels: cachedModels ?? [],
        cachedMetrics: cachedMetrics ?? []
      }
    };

    let blockmlRebuildStructResponse =
      await this.rabbitService.sendToBlockml<ToBlockmlRebuildStructResponse>({
        routingKey: RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
        message: toBlockmlRebuildStructRequest,
        checkIsOk: true
      });

    let rs = blockmlRebuildStructResponse.payload;

    let struct: StructTab = {
      projectId: projectId,
      structId: structId,
      mproveConfig: rs.mproveConfig,
      errors: rs.errors,
      metrics: rs.metrics,
      presets: rs.presets,
      mproveVersion:
        this.cs.get<BackendConfig['mproveReleaseTag']>('mproveReleaseTag'),
      serverTs: undefined
    };

    rs.reports.forEach(report => {
      let newRows = processRowIds({
        rows: report.rows,
        targetRowIds: report.rows.map(r => r.rowId)
      });

      report.rows = newRows;
    });

    if (isUndefined(skipDb) || skipDb === false) {
      await retry(
        async () => {
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
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
              })
          );
        },
        getRetryOption(this.cs, this.logger)
      );
    }

    return {
      struct: struct,
      models: rs.models,
      reports: rs.reports,
      dashboards: rs.dashboards,
      charts: rs.charts,
      metrics: rs.metrics,
      mconfigs: rs.mconfigs,
      queries: rs.queries
    };
  }
}
