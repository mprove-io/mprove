import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import type { ChartTab } from '#backend/drizzle/postgres/tables/charts';
import type { EnvTab } from '#backend/drizzle/postgres/tables/envs';
import type { MconfigTab } from '#backend/drizzle/postgres/tables/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import type { SessionTab } from '#backend/drizzle/postgres/tables/sessions';
import { rebuildStruct } from '#backend/functions/blockml/rebuild-struct/rebuild-struct';
import { chartApiToTab } from '#backend/functions/db/charts/chart-api-to-tab/chart-api-to-tab';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { mconfigApiToTab } from '#backend/functions/db/mconfigs/mconfig-api-to-tab/mconfig-api-to-tab';
import { getModelCheckExistsAndAccess } from '#backend/functions/db/models/get-model-check-exists-and-access/get-model-check-exists-and-access';
import { queryApiToTab } from '#backend/functions/db/queries/query-api-to-tab/query-api-to-tab';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { getSelectedGivens } from '#backend/functions/db/users/get-selected-givens/get-selected-givens';
import { getUserCheckExists } from '#backend/functions/db/users/get-user-check-exists/get-user-check-exists';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import {
  MPROVE_CONFIG_DIR_DOT_SLASH,
  MPROVE_USERS_FOLDER
} from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetEnvCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import type { RebuildFromYamlError } from '#common/types/backend/function-errors/rebuild-from-yaml-error';
import type { BmlError } from '#common/types/blockml/diagnostics/bml-error';
import type { Chart } from '#common/types/blockml/parts/chart/chart';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { Tile } from '#common/types/blockml/parts/tile/tile';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';

type PrepareChartFilePayload = {
  mdir: string;
  parentNodeId: string;
  fileName: string;
  fileNodeId: string;
  fileIdAr: string[];
  pathString: string;
  diskFile: DiskCatalogFile;
};

export type ExplorerRebuildOk = {
  ok: true;
  chart: ChartTab;
  mconfig: MconfigTab;
  query: QueryTab;
};

export type ExplorerRebuildErr = {
  ok: false;
  errors: BmlError[];
};

export type ExplorerRebuildResult = ExplorerRebuildOk | ExplorerRebuildErr;

@Injectable()
export class ExplorerChartRebuildService {
  constructor(
    private db: DbService,
    private cs: ConfigService<BackendConfig>,
    private tabService: TabService,
    private rpcService: RpcService,
    private logger: Logger
  ) {}

  async rebuildFromYaml(item: {
    traceId: string;
    session: SessionTab;
    chartId: string;
    modelId: string;
    chartYaml: string;
  }): Result.ResultAsync<ExplorerRebuildResult, RebuildFromYamlError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.session.projectId)
        })
      ),
      Result.bind('user', v =>
        getUserCheckExists({
          userId: v.session.userId,
          db: this.db
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.session.userId),
            eq(membersTable.projectId, v.session.projectId)
          )
        })
      ),
      Result.bind('branch', v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.session.projectId),
            eq(branchesTable.repoId, v.session.repoId),
            eq(branchesTable.branchId, v.session.branchId)
          )
        })
      ),
      Result.andThrough(async v => {
        let envAccessResult: Result.Result<
          EnvTab,
          GetEnvCheckExistsAndAccessError
        > = await getEnvCheckExistsAndAccess({
          db: this.db,
          projectId: v.session.projectId,
          envId: v.session.envId,
          member: v.userMember
        });

        if (Result.isFailure(envAccessResult)) {
          return envAccessResult;
        }

        return Result.succeed();
      }),
      Result.bind('bridge', v =>
        this.db.bridges.findFirstCheckExists({
          where: and(
            eq(bridgesTable.projectId, v.branch.projectId),
            eq(bridgesTable.repoId, v.branch.repoId),
            eq(bridgesTable.branchId, v.branch.branchId),
            eq(bridgesTable.envId, v.session.envId)
          )
        })
      ),
      Result.bind('currentStruct', v =>
        getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.session.projectId,
          cs: this.cs,
          db: this.db
        })
      ),
      Result.bind('model', v =>
        getModelCheckExistsAndAccess({
          structId: v.bridge.structId,
          modelId: v.modelId,
          userMember: v.userMember,
          db: this.db
        })
      ),
      Result.bind('prepareChartFilePayload', v => {
        let mdir: string = v.currentStruct.mproveConfig.mproveDirValue;

        if (
          mdir.length > 2 &&
          mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH
        ) {
          mdir = mdir.substring(2);
        }

        let parentNodeId: string =
          v.currentStruct.mproveConfig.mproveDirValue ===
          MPROVE_CONFIG_DIR_DOT_SLASH
            ? `${v.session.projectId}/${MPROVE_USERS_FOLDER}/${v.user.alias}`
            : `${v.session.projectId}/${mdir}/${MPROVE_USERS_FOLDER}/${v.user.alias}`;

        let fileName: string = `${v.chartId}${'.chart' satisfies FileExtension}`;

        let fileNodeId: string = `${parentNodeId}/${fileName}`;

        let fileIdAr: string[] = fileNodeId.split('/');

        fileIdAr.shift();

        let pathString: string = fileIdAr.join('/');

        let diskFile: DiskCatalogFile = {
          projectId: v.session.projectId,
          repoId: v.session.repoId,
          fileId: fileNodeId,
          pathString: pathString,
          fileNodeId: fileNodeId,
          name: fileName,
          content: v.chartYaml
        };

        let prepareChartFilePayload: PrepareChartFilePayload = {
          mdir: mdir,
          parentNodeId: parentNodeId,
          fileName: fileName,
          fileNodeId: fileNodeId,
          fileIdAr: fileIdAr,
          pathString: pathString,
          diskFile: diskFile
        };

        return Result.succeed(prepareChartFilePayload);
      }),
      Result.bind('selectedGivens', v =>
        getSelectedGivens({
          user: v.user,
          projectId: v.session.projectId,
          db: this.db
        })
      ),
      Result.bind('rebuild', v =>
        rebuildStruct({
          traceId: v.traceId,
          orgId: v.project.orgId,
          projectId: v.session.projectId,
          repoId: v.session.repoId,
          structId: v.bridge.structId,
          diskFiles: [v.prepareChartFilePayload.diskFile],
          mproveDir: v.currentStruct.mproveConfig.mproveDirValue,
          skipDb: true,
          envId: v.session.envId,
          selectedGivens: v.selectedGivens,
          overrideTimezone: undefined,
          isUseCache: true,
          cachedMproveConfig: v.currentStruct.mproveConfig,
          cachedModels: [v.model],
          cachedMetrics: [],
          db: this.db,
          tabService: this.tabService,
          rpcService: this.rpcService,
          cs: this.cs,
          logger: this.logger
        })
      ),
      Result.andThen(v => {
        if (v.rebuild.struct.errors.length > 0) {
          let explorerRebuildResult: ExplorerRebuildResult = {
            ok: false,
            errors: v.rebuild.struct.errors
          };

          return Result.succeed(explorerRebuildResult);
        }

        let apiChart: Chart = v.rebuild.charts.find(
          x => x.chartId === v.chartId
        );

        if (isUndefined(apiChart)) {
          return Result.fail({
            code: 'BACKEND_CREATE_CHART_FAIL',
            displayData: { structErrors: v.rebuild.struct.errors }
          });
        }

        let chartTile: Tile = apiChart.tiles[0];

        let apiMconfig: Mconfig = v.rebuild.mconfigs.find(
          x => x.mconfigId === chartTile.mconfigId
        );

        let apiQuery: Query = v.rebuild.queries.find(
          x => x.queryId === chartTile.queryId
        );

        let newMconfig: MconfigTab = mconfigApiToTab({
          apiMconfig: apiMconfig
        });

        let newQuery: QueryTab = queryApiToTab({
          apiQuery: apiQuery
        });

        let chartTab: ChartTab = chartApiToTab({
          apiChart: {
            ...apiChart,
            draft: true,
            isExplorer: true,
            sessionId: v.session.sessionId,
            chartYaml: v.chartYaml,
            creatorId: v.session.userId
          },
          chartType: apiMconfig.chart.type
        });

        newMconfig.sessionId = v.session.sessionId;

        newQuery.sessionId = v.session.sessionId;

        let explorerRebuildResult: ExplorerRebuildResult = {
          ok: true,
          chart: chartTab,
          mconfig: newMconfig,
          query: newQuery
        };

        return Result.succeed(explorerRebuildResult);
      })
    );
  }
}
