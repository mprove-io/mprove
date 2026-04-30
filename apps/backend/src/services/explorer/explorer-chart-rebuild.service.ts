import { Inject, Injectable } from '@nestjs/common';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ChartTab,
  MconfigTab,
  QueryTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { BlockmlService } from '#backend/services/blockml.service';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { ChartsService } from '#backend/services/db/charts.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MconfigsService } from '#backend/services/db/mconfigs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { QueriesService } from '#backend/services/db/queries.service';
import { StructsService } from '#backend/services/db/structs.service';
import { UsersService } from '#backend/services/db/users.service';
import {
  MPROVE_CONFIG_DIR_DOT_SLASH,
  MPROVE_USERS_FOLDER
} from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { BmlError } from '#common/zod/blockml/bml-error';
import type { DiskCatalogFile } from '#common/zod/disk/disk-catalog-file';

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
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private modelsService: ModelsService,
    private blockmlService: BlockmlService,
    private chartsService: ChartsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async rebuildFromYaml(item: {
    traceId: string;
    session: SessionTab;
    chartId: string;
    modelId: string;
    chartYaml: string;
  }): Promise<ExplorerRebuildResult> {
    let { traceId, session, chartId, modelId, chartYaml } = item;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: session.projectId
    });

    let user = await this.usersService.getUserCheckExists({
      userId: session.userId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: session.projectId,
      memberId: session.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: session.projectId,
      repoId: session.repoId,
      branchId: session.branchId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: session.projectId,
      envId: session.envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: session.envId
    });

    let currentStruct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: session.projectId
    });

    let model = await this.modelsService.getModelCheckExistsAndAccess({
      structId: bridge.structId,
      modelId: modelId,
      userMember: userMember
    });

    let mdir = currentStruct.mproveConfig.mproveDirValue;

    if (
      mdir.length > 2 &&
      mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH
    ) {
      mdir = mdir.substring(2);
    }

    let parentNodeId =
      currentStruct.mproveConfig.mproveDirValue === MPROVE_CONFIG_DIR_DOT_SLASH
        ? `${session.projectId}/${MPROVE_USERS_FOLDER}/${user.alias}`
        : `${session.projectId}/${mdir}/${MPROVE_USERS_FOLDER}/${user.alias}`;

    let fileName = `${chartId}${FileExtensionEnum.Chart}`;
    let fileNodeId = `${parentNodeId}/${fileName}`;

    let fileIdAr = fileNodeId.split('/');
    fileIdAr.shift();
    let pathString = fileIdAr.join('/');

    let diskFile: DiskCatalogFile = {
      projectId: session.projectId,
      repoId: session.repoId,
      fileId: fileNodeId,
      pathString: pathString,
      fileNodeId: fileNodeId,
      name: fileName,
      content: chartYaml
    };

    let {
      charts: apiCharts,
      mconfigs: apiMconfigs,
      queries: apiQueries,
      struct: tempStruct
    } = await this.blockmlService.rebuildStruct({
      traceId: traceId,
      orgId: project.orgId,
      projectId: session.projectId,
      repoId: session.repoId,
      structId: bridge.structId,
      diskFiles: [diskFile],
      mproveDir: currentStruct.mproveConfig.mproveDirValue,
      skipDb: true,
      envId: session.envId,
      overrideTimezone: undefined,
      isUseCache: true,
      cachedMproveConfig: currentStruct.mproveConfig,
      cachedModels: [model],
      cachedMetrics: []
    });

    if (tempStruct.errors.length > 0) {
      return { ok: false, errors: tempStruct.errors };
    }

    let apiChart = apiCharts.find(x => x.chartId === chartId);

    if (isUndefined(apiChart)) {
      throw new ServerError({
        message: ErEnum.BACKEND_CREATE_CHART_FAIL,
        displayData: { structErrors: tempStruct.errors }
      });
    }

    let chartTile = apiChart.tiles[0];
    let apiMconfig = apiMconfigs.find(x => x.mconfigId === chartTile.mconfigId);
    let apiQuery = apiQueries.find(x => x.queryId === chartTile.queryId);

    let newMconfig = this.mconfigsService.apiToTab({ apiMconfig: apiMconfig });
    let newQuery = this.queriesService.apiToTab({ apiQuery: apiQuery });

    let chartTab = this.chartsService.apiToTab({
      apiChart: apiChart,
      chartType: apiMconfig.chart.type
    });

    chartTab.draft = true;
    chartTab.isExplorer = true;
    chartTab.sessionId = session.sessionId;
    chartTab.chartYaml = chartYaml;
    chartTab.creatorId = session.userId;

    newMconfig.sessionId = session.sessionId;
    newQuery.sessionId = session.sessionId;

    return {
      ok: true,
      chart: chartTab,
      mconfig: newMconfig,
      query: newQuery
    };
  }
}
