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
import { and, eq, inArray } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { EMPTY_STRUCT_ID, PROD_REPO_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { isUndefined } from '#common/functions/is-undefined';
import {
  ToBackendSaveModifyChartRequest,
  ToBackendSaveModifyChartResponsePayload
} from '#common/interfaces/to-backend/charts/to-backend-save-modify-chart';
import {
  ToDiskSaveFileRequest,
  ToDiskSaveFileResponse
} from '#common/interfaces/to-disk/07-files/to-disk-save-file';
import { ServerError } from '#common/models/server-error';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { Db, DRIZZLE } from '~backend/drizzle/drizzle.module';
import {
  MconfigTab,
  QueryTab,
  UserTab
} from '~backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '~backend/drizzle/postgres/schema/charts';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { checkModelAccess } from '~backend/functions/check-model-access';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeChartFileText } from '~backend/functions/make-chart-file-text';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { ChartsService } from '~backend/services/db/charts.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MconfigsService } from '~backend/services/db/mconfigs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ModelsService } from '~backend/services/db/models.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { QueriesService } from '~backend/services/db/queries.service';
import { StructsService } from '~backend/services/db/structs.service';
import { UsersService } from '~backend/services/db/users.service';
import { RpcService } from '~backend/services/rpc.service';
import { TabService } from '~backend/services/tab.service';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SaveModifyChartController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private mconfigsService: MconfigsService,
    private rpcService: RpcService,
    private structsService: StructsService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private chartsService: ChartsService,
    private modelsService: ModelsService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private queriesService: QueriesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSaveModifyChart)
  async saveModifyChart(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSaveModifyChartRequest = request.body;

    this.usersService.checkUserIsNotRestricted({ user: user });

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      fromChartId,
      chartId,
      tileTitle,
      timezone
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

    let existingChart = await this.chartsService.getChartCheckExists({
      structId: bridge.structId,
      chartId: chartId,
      userMember: userMember,
      user: user
    });

    if (userMember.isAdmin === false && userMember.isEditor === false) {
      this.chartsService.checkChartPath({
        userAlias: user.alias,
        filePath: existingChart.filePath
      });
    }

    let mconfig = await this.mconfigsService.getMconfigCheckExists({
      structId: bridge.structId,
      mconfigId: existingChart.tiles[0].mconfigId
    });

    let model = await this.modelsService.getModelCheckExistsAndAccess({
      structId: bridge.structId,
      modelId: mconfig.modelId,
      userMember: userMember
    });

    let pathParts = existingChart.filePath.split('.');
    pathParts[pathParts.length - 1] = FileExtensionEnum.Malloy.slice(1);

    let { chartFileText } = makeChartFileText({
      mconfig: this.mconfigsService.tabToApi({
        mconfig: mconfig,
        modelFields: model.fields
      }),
      tileTitle: tileTitle,
      chartId: chartId,
      modelId: model.modelId,
      modelFilePath: model.filePath
    });

    let baseProject = this.tabService.projectTabToBaseProject({
      project: project
    });

    let toDiskSaveFileRequest: ToDiskSaveFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: baseProject,
        repoId: repoId,
        branch: branchId,
        fileNodeId: existingChart.filePath,
        userAlias: user.alias,
        content: chartFileText
      }
    };

    let diskResponse = await this.rpcService.sendToDisk<ToDiskSaveFileResponse>(
      {
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        message: toDiskSaveFileRequest,
        checkIsOk: true
      }
    );

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
        file => file.fileNodeId === existingChart.filePath
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
      struct: tempStruct,
      charts: apiCharts,
      mconfigs: apiMconfigs,
      queries: apiQueries
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
      overrideTimezone: timezone,
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

    let apiChart = apiCharts.find(x => x.chartId === chartId);

    if (isUndefined(apiChart)) {
      await retry(
        async () =>
          await this.db.drizzle.transaction(async tx => {
            await tx
              .delete(chartsTable)
              .where(
                and(
                  eq(chartsTable.chartId, chartId),
                  eq(chartsTable.structId, bridge.structId)
                )
              );
          }),
        getRetryOption(this.cs, this.logger)
      );

      let fileIdAr = existingChart.filePath.split('/');
      fileIdAr.shift();
      let filePath = fileIdAr.join('/');

      throw new ServerError({
        message: ErEnum.BACKEND_MODIFY_CHART_FAIL,
        displayData: {
          encodedFileId: encodeFilePath({ filePath: filePath }),
          structErrors: tempStruct.errors
        }
      });
    }

    let chartTile = apiChart.tiles[0];

    let chartApiMconfig = apiMconfigs.find(
      x => x.mconfigId === chartTile.mconfigId
    );

    let chartApiQuery = apiQueries.find(x => x.queryId === chartTile.queryId);

    let newMconfig: MconfigTab = this.mconfigsService.apiToTab({
      apiMconfig: chartApiMconfig
    });

    let newQuery: QueryTab = this.queriesService.apiToTab({
      apiQuery: chartApiQuery
    });

    let isError = false;

    if (model.type === ModelTypeEnum.Store) {
      let mqe = await this.mconfigsService.prepStoreMconfigQuery({
        struct: tempStruct,
        project: project,
        envId: envId,
        mconfigParentType: MconfigParentTypeEnum.Chart,
        mconfigParentId: chartId,
        model: model,
        mconfig: newMconfig,
        metricsStartDateYYYYMMDD: undefined,
        metricsEndDateYYYYMMDD: undefined
      });

      newMconfig = mqe.newMconfig;
      newQuery = mqe.newQuery;
      isError = mqe.isError;
    }

    let chart = this.chartsService.apiToTab({
      apiChart: apiChart,
      chartType: chartApiMconfig.chart.type
    });

    chart.tiles[0].mconfigId = newMconfig.mconfigId;
    chart.tiles[0].queryId = newMconfig.queryId;

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
              mconfigs: [newMconfig]
            },
            insertOrUpdate: {
              charts: [chart],
              queries: isError === true ? [newQuery] : []
            },
            insertOrDoNothing: {
              queries: isError === false ? [newQuery] : []
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let query = await this.db.drizzle.query.queriesTable
      .findFirst({
        where: and(
          eq(queriesTable.queryId, newQuery.queryId),
          eq(queriesTable.projectId, newQuery.projectId)
        )
      })
      .then(x => this.tabService.queryEntToTab(x));

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let modelApi = this.modelsService.tabToApi({
      model: model,
      hasAccess: checkModelAccess({
        member: userMember,
        modelAccessRoles: model.accessRoles
      })
    });

    let payload: ToBackendSaveModifyChartResponsePayload = {
      chart: this.chartsService.tabToApi({
        chart: chart,
        mconfigs: [
          this.mconfigsService.tabToApi({
            mconfig: newMconfig,
            modelFields: modelApi.fields
          })
        ],
        queries: [this.queriesService.tabToApi({ query: query })],
        member: apiUserMember,
        models: [modelApi],
        isAddMconfigAndQuery: true
      }),
      chartPart: this.chartsService.tabToApi({
        chart: chart,
        mconfigs: [],
        queries: [],
        member: apiUserMember,
        models: [modelApi],
        isAddMconfigAndQuery: false
      })
    };

    return payload;
  }
}
