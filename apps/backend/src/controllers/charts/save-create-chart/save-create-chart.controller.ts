import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import pIteration from 'p-iteration';

const { forEachSeries } = pIteration;

import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { ModelEnt, modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { makeChartFileText } from '#backend/functions/make-chart-file-text';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
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
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service';
import {
  EMPTY_STRUCT_ID,
  MPROVE_CONFIG_DIR_DOT_SLASH,
  MPROVE_USERS_FOLDER,
  PROD_REPO_ID
} from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { isUndefined } from '#common/functions/is-undefined';
import {
  ToBackendSaveCreateChartRequest,
  ToBackendSaveCreateChartResponsePayload
} from '#common/interfaces/to-backend/charts/to-backend-save-create-chart';
import {
  ToDiskCreateFileRequest,
  ToDiskCreateFileResponse
} from '#common/interfaces/to-disk/07-files/to-disk-create-file';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SaveCreateChartController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private chartsService: ChartsService,
    private branchesService: BranchesService,
    private rpcService: RpcService,
    private structsService: StructsService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSaveCreateChart)
  async saveCreateChart(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSaveCreateChartRequest = request.body;

    this.usersService.checkUserIsNotRestricted({ user: user });

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      fromChartId,
      newChartId,
      tileTitle,
      mconfig,
      envId
    } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    await this.projectsService.checkProjectIsNotRestricted({
      projectId: projectId,
      userMember: userMember,
      repoId: repoId
    });

    if (userMember.isExplorer === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_MEMBER_IS_NOT_EXPLORER
      });
    }

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let currentStruct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let model = await this.modelsService.getModelCheckExistsAndAccess({
      structId: bridge.structId,
      modelId: mconfig.modelId,
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
        ? `${projectId}/${MPROVE_USERS_FOLDER}/${user.alias}`
        : `${projectId}/${mdir}/${MPROVE_USERS_FOLDER}/${user.alias}`;

    let fileName = `${newChartId}${FileExtensionEnum.Chart}`;

    let { chartFileText } = makeChartFileText({
      mconfig: mconfig,
      tileTitle: tileTitle,
      chartId: newChartId,
      modelId: model.modelId,
      modelFilePath: model.filePath
    });

    let baseProject = this.tabService.projectTabToBaseProject({
      project: project
    });

    let toDiskCreateFileRequest: ToDiskCreateFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: baseProject,
        repoId: repoId,
        branch: branchId,
        userAlias: user.alias,
        parentNodeId: parentNodeId,
        fileName: fileName,
        fileText: chartFileText
      }
    };

    let diskResponse =
      await this.rpcService.sendToDisk<ToDiskCreateFileResponse>({
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        message: toDiskCreateFileRequest,
        checkIsOk: true
      });

    let branchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, branch.projectId),
        eq(bridgesTable.repoId, branch.repoId),
        eq(bridgesTable.branchId, branch.branchId)
      )
    });

    await forEachSeries(branchBridges, async x => {
      if (x.envId !== envId) {
        x.structId = EMPTY_STRUCT_ID;
        x.needValidate = true;
      }
    });

    let diskFiles = [
      diskResponse.payload.files.find(
        file => file.fileNodeId === `${parentNodeId}/${fileName}`
      )
    ];

    let modelIds = [mconfig.modelId];

    let cachedModels = await this.db.drizzle.query.modelsTable
      .findMany({
        where: and(
          eq(modelsTable.structId, bridge.structId),
          inArray(modelsTable.modelId, modelIds)
        )
      })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let {
      charts: apiCharts,
      mconfigs: apiMconfigs,
      queries: apiQueries,
      struct: tempStruct
    } = await this.blockmlService.rebuildStruct({
      traceId: traceId,
      orgId: project.orgId,
      projectId: projectId,
      repoId: repoId,
      structId: bridge.structId,
      diskFiles: diskFiles,
      mproveDir: currentStruct.mproveConfig.mproveDirValue,
      skipDb: true,
      envId: envId,
      overrideTimezone: undefined,
      isUseCache: true,
      cachedMproveConfig: currentStruct.mproveConfig,
      cachedModels: cachedModels,
      cachedMetrics: []
    });

    currentStruct.errors = [...currentStruct.errors, ...tempStruct.errors];

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await this.db.packer.write({
            tx: tx,
            insertOrUpdate: {
              structs: [currentStruct],
              bridges: [...branchBridges]
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let apiChart = apiCharts.find(x => x.chartId === newChartId);

    if (isUndefined(apiChart)) {
      let fileId = `${parentNodeId}/${fileName}`;
      let fileIdAr = fileId.split('/');
      fileIdAr.shift();

      let filePath = fileIdAr.join('/');

      throw new ServerError({
        message: ErEnum.BACKEND_CREATE_CHART_FAIL,
        displayData: {
          encodedFileId: encodeFilePath({ filePath: filePath }),
          structErrors: tempStruct.errors
        }
      });
    }

    let chartTile = apiChart.tiles[0];

    let apiMconfig = apiMconfigs.find(x => x.mconfigId === chartTile.mconfigId);

    let apiQuery = apiQueries.find(x => x.queryId === chartTile.queryId);

    let newMconfig = this.mconfigsService.apiToTab({
      apiMconfig: apiMconfig
    });

    let newQuery = this.queriesService.apiToTab({
      apiQuery: apiQuery
    });

    let chart = this.chartsService.apiToTab({
      apiChart: apiChart,
      chartType: apiMconfig.chart.type
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(chartsTable)
            .where(
              and(
                eq(chartsTable.draft, true),
                eq(chartsTable.chartId, fromChartId),
                eq(chartsTable.structId, bridge.structId)
              )
            );

          await this.db.packer.write({
            tx: tx,
            insert: {
              charts: [chart],
              mconfigs: [newMconfig]
            },
            insertOrDoNothing: {
              queries: [newQuery]
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let models = await this.db.drizzle
      .select({
        keyTag: modelsTable.keyTag,
        modelId: modelsTable.modelId,
        connectionId: modelsTable.connectionId,
        connectionType: modelsTable.connectionType,
        st: modelsTable.st
        // lt: {},
      })
      .from(modelsTable)
      .where(eq(modelsTable.structId, bridge.structId))
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x as ModelEnt)));

    let payload: ToBackendSaveCreateChartResponsePayload = {
      chart: this.chartsService.tabToApi({
        chart: chart,
        mconfigs: [],
        queries: [],
        member: this.membersService.tabToApi({ member: userMember }),
        models: models.map(model =>
          this.modelsService.tabToApi({
            model: model,
            hasAccess: checkModelAccess({
              member: userMember,
              modelAccessRoles: model.accessRoles
            })
          })
        ),
        isAddMconfigAndQuery: false
      })
    };

    return payload;
  }
}
