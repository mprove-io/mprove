import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { StructEnt } from '~backend/drizzle/postgres/schema/structs';
import { diskFilesToBlockmlFiles } from '~backend/functions/disk-files-to-blockml-files';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { processRowIds } from '~backend/functions/process-row-ids';
import { RabbitBlockmlRoutingEnum } from '~common/enums/rabbit-blockml-routing-keys.enum';
import { ToBlockmlRequestInfoNameEnum } from '~common/enums/to/to-blockml-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { Ev } from '~common/interfaces/backend/ev';
import { MproveConfig } from '~common/interfaces/backend/mprove-config';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { Model } from '~common/interfaces/blockml/model';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import {
  ToBlockmlRebuildStructRequest,
  ToBlockmlRebuildStructResponse
} from '~common/interfaces/to-blockml/api/to-blockml-rebuild-struct';
import { EnvsService } from './envs.service';
import { RabbitService } from './rabbit.service';
import { WrapToApiService } from './wrap-to-api.service';
import { WrapToEntService } from './wrap-to-ent.service';

let retry = require('async-retry');

@Injectable()
export class BlockmlService {
  constructor(
    private rabbitService: RabbitService,
    private envsService: EnvsService,
    private wrapToEntService: WrapToEntService,
    private wrapToApiService: WrapToApiService,
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
    connections?: ProjectConnection[];
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

    let connectionsWithFallback: ProjectConnection[] = [];

    if (
      isUndefined(connections) &&
      apiEnv?.envConnectionIdsWithFallback.length > 0
    ) {
      let connectionsEnts =
        await this.db.drizzle.query.connectionsTable.findMany({
          where: and(
            eq(connectionsTable.projectId, projectId),
            inArray(
              connectionsTable.connectionId,
              apiEnv.envConnectionIdsWithFallback
            )
          )
        });

      connectionsWithFallback = connectionsEnts.map(x =>
        this.wrapToApiService.wrapToApiConnection({
          connection: x,
          isIncludePasswords: true
        })
      );
    }

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
        connections: isDefined(connections)
          ? connections
          : connectionsWithFallback,
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

    let struct: StructEnt = {
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
                    this.wrapToEntService.wrapToEntityChart({
                      chart: x,
                      chartType: rs.mconfigs.find(
                        mconfig => mconfig.mconfigId === x.tiles[0].mconfigId
                      ).chart.type
                    })
                  ),
                  models: rs.models.map(x =>
                    this.wrapToEntService.wrapToEntityModel(x)
                  ),
                  reports: rs.reports.map(x =>
                    this.wrapToEntService.wrapToEntityReport(x)
                  ),
                  mconfigs: rs.mconfigs.map(x =>
                    this.wrapToEntService.wrapToEntityMconfig(x)
                  ),
                  dashboards: rs.dashboards.map(x =>
                    this.wrapToEntService.wrapToEntityDashboard(x)
                  )
                },
                insertOrDoNothing: {
                  queries: rs.queries.map(x =>
                    this.wrapToEntService.wrapToEntityQuery(x)
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
