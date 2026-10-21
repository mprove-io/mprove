import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type {
  ChartTab,
  EnvTab,
  MconfigTab,
  QueryTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { ChartsService } from '#backend/services/db/charts/charts.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { UsersService } from '#backend/services/db/users/users.service';
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
    private usersService: UsersService,
    private envsService: EnvsService,
    private structsService: StructsService,
    private modelsService: ModelsService,
    private blockmlService: BlockmlService,
    private chartsService: ChartsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private db: DbService
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
        this.usersService.getUserCheckExists({
          userId: v.session.userId
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
        > = await this.envsService.getEnvCheckExistsAndAccess({
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
        this.structsService.getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.session.projectId
        })
      ),
      Result.bind('model', v =>
        this.modelsService.getModelCheckExistsAndAccess({
          structId: v.bridge.structId,
          modelId: v.modelId,
          userMember: v.userMember
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
        this.usersService.getSelectedGivens({
          user: v.user,
          projectId: v.session.projectId
        })
      ),
      Result.bind('rebuild', v =>
        this.blockmlService.rebuildStruct({
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
          cachedMetrics: []
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

        let newMconfig: MconfigTab = this.mconfigsService.apiToTab({
          apiMconfig: apiMconfig
        });

        let newQuery: QueryTab = this.queriesService.apiToTab({
          apiQuery: apiQuery
        });

        let chartTab: ChartTab = this.chartsService.apiToTab({
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
