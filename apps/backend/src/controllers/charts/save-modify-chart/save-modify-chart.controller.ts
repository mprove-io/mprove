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
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '~backend/drizzle/postgres/schema/charts';
import { MconfigEnt } from '~backend/drizzle/postgres/schema/mconfigs';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { checkAccess } from '~backend/functions/check-access';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeChartFileText } from '~backend/functions/make-chart-file-text';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { ChartsService } from '~backend/services/charts.service';
import { EnvsService } from '~backend/services/envs.service';
import { MalloyService } from '~backend/services/malloy.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { QueriesService } from '~backend/services/queries.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';
import {
  EMPTY_STRUCT_ID,
  PROD_REPO_ID,
  RESTRICTED_USER_ALIAS
} from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Query } from '~common/interfaces/blockml/query';
import {
  ToBackendSaveModifyChartRequest,
  ToBackendSaveModifyChartResponsePayload
} from '~common/interfaces/to-backend/charts/to-backend-save-modify-chart';
import {
  ToDiskSaveFileRequest,
  ToDiskSaveFileResponse
} from '~common/interfaces/to-disk/07-files/to-disk-save-file';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SaveModifyChartController {
  constructor(
    private malloyService: MalloyService,
    private branchesService: BranchesService,
    private mconfigsService: MconfigsService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private chartsService: ChartsService,
    private modelsService: ModelsService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private wrapToEntService: WrapToEntService,
    private wrapToApiService: WrapEnxToApiService,
    private queriesService: QueriesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSaveModifyChart)
  async saveModifyChart(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSaveModifyChartRequest = request.body;

    if (user.alias === RESTRICTED_USER_ALIAS) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      fromChartId,
      chartId,
      tileTitle,
      accessRoles,
      timezone
    } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    if (member.isExplorer === false) {
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
      member: member
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
      // skipMetrics: false
    });

    let demoProjectId =
      this.cs.get<BackendConfig['demoProjectId']>('demoProjectId');

    if (
      member.isAdmin === false &&
      projectId === demoProjectId &&
      repoId === PROD_REPO_ID
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let existingChart = await this.chartsService.getChartCheckExists({
      structId: bridge.structId,
      chartId: chartId
    });

    let mconfigEnt = await this.mconfigsService.getMconfigCheckExists({
      structId: bridge.structId,
      mconfigId: existingChart.tiles[0].mconfigId
    });

    // console.log('saveModifyChart mconfigEnt.select');
    // console.log(mconfigEnt.select);

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: mconfigEnt.modelId
    });

    let mconfig = this.wrapToApiService.wrapToApiMconfig({
      mconfig: mconfigEnt,
      modelFields: model.fields
    });

    if (member.isAdmin === false && member.isEditor === false) {
      this.chartsService.checkChartPath({
        userAlias: user.alias,
        filePath: existingChart.filePath
      });
    }

    let mconfigModel = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: mconfig.modelId
    });

    let isAccessGranted = checkAccess({
      userAlias: user.alias,
      member: member,
      entity: mconfigModel
    });

    if (isAccessGranted === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let pathParts = existingChart.filePath.split('.');
    pathParts[pathParts.length - 1] = FileExtensionEnum.Malloy.slice(1);

    // let secondFileNodeId =
    //   mconfig.modelType === ModelTypeEnum.Malloy
    //     ? pathParts.join('.')
    //     : undefined;

    let {
      chartFileText
      // malloyFileText
    } = makeChartFileText({
      mconfig: mconfig,
      tileTitle: tileTitle,
      roles: accessRoles,
      chartId: chartId,
      modelId: mconfigModel.modelId,
      modelFilePath: mconfigModel.filePath
      // malloyChartFilePath: secondFileNodeId
    });

    let apiProject = this.wrapToApiService.wrapToApiProject({
      project: project,
      isAddGitUrl: true,
      isAddPrivateKey: true,
      isAddPublicKey: true
    });

    let toDiskSaveFileRequest: ToDiskSaveFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: apiProject,
        repoId: repoId,
        branch: branchId,
        fileNodeId: existingChart.filePath,
        userAlias: user.alias,
        content: chartFileText
        // secondFileNodeId: isDefined(malloyFileText)
        //   ? secondFileNodeId
        //   : undefined,
        // secondFileContent: malloyFileText,
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<ToDiskSaveFileResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskSaveFileRequest,
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
        file => file.fileNodeId === existingChart.filePath
      )
    ];

    let modelIds = [mconfig.modelId];

    let cachedModels = await this.db.drizzle.query.modelsTable.findMany({
      where: and(
        eq(modelsTable.structId, bridge.structId),
        inArray(modelsTable.modelId, modelIds)
      )
    });

    let { struct, charts, mconfigs, queries } =
      await this.blockmlService.rebuildStruct({
        traceId: traceId,
        projectId: projectId,
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

    currentStruct.errors = [...currentStruct.errors, ...struct.errors];

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

    let chart = charts.find(x => x.chartId === chartId);

    if (isUndefined(chart)) {
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
          structErrors: struct.errors
        }
      });
    }

    let chartTile = isDefined(chart) ? chart.tiles[0] : undefined;

    let chartMconfig = isDefined(chart)
      ? mconfigs.find(x => x.mconfigId === chartTile.mconfigId)
      : undefined;

    let chartQuery = isDefined(chart)
      ? queries.find(x => x.queryId === chartTile.queryId)
      : undefined;

    let chartEnt = isDefined(chart)
      ? this.wrapToEntService.wrapToEntityChart({
          chart: chart,
          chartType: chartMconfig.chart.type
        })
      : undefined;

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
              mconfigs: [chartMconfig]
            },
            insertOrUpdate: {
              charts: isDefined(chart) ? [chartEnt] : []
            },
            insertOrDoNothing: {
              queries: [chartQuery]
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let modelEnt = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: mconfig.modelId
    });

    let modelApi = this.wrapToApiService.wrapEnxToApiModel({
      model: modelEnt,
      hasAccess: checkAccess({
        userAlias: user.alias,
        member: member,
        entity: modelEnt
      })
    });

    let query = await this.queriesService.getQueryCheckExists({
      queryId: chartMconfig.queryId,
      projectId: projectId
    });

    let newMconfig: Mconfig;
    let newQuery: Query;

    let isError = false;

    let newMconfigId = makeId();
    let newQueryId = makeId();

    if (model.type === ModelTypeEnum.Store) {
      // biome-ignore format: theme breaks
      let sMconfig = Object.assign({}, chartMconfig, <MconfigEnt>{
        mconfigId: newMconfigId,
        queryId: newQueryId,
        timezone: timezone,
        temp: true
      });

      let mqe = await this.mconfigsService.prepStoreMconfigQuery({
        struct: struct,
        project: project,
        envId: envId,
        model: model,
        mconfig: sMconfig,
        metricsStartDateYYYYMMDD: undefined,
        metricsEndDateYYYYMMDD: undefined
      });

      newMconfig = mqe.newMconfig;
      newQuery = mqe.newQuery;
      isError = mqe.isError;
    } else if (model.type === ModelTypeEnum.Malloy) {
      //   let queryOperation: QueryOperation = {
      //     type: QueryOperationTypeEnum.Get,
      //     timezone: timezone
      //   };

      //   let editMalloyQueryResult = await this.malloyService.editMalloyQuery({
      //     projectId: projectId,
      //     envId: envId,
      //     structId: struct.structId,
      //     model: model,
      //     mconfig: chartMconfig,
      //     queryOperations: [queryOperation]
      //   });

      //   newMconfig = editMalloyQueryResult.newMconfig;
      //   newQuery = editMalloyQueryResult.newQuery;
      //   isError = editMalloyQueryResult.isError;

      newQuery = chartQuery;
      newMconfig = Object.assign({}, chartMconfig, <MconfigEnt>{
        mconfigId: newMconfigId
      });
    }

    let newQueryEnt = this.wrapToEntService.wrapToEntityQuery(newQuery);
    let newMconfigEnt = this.wrapToEntService.wrapToEntityMconfig(newMconfig);

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                mconfigs: [newMconfigEnt]
              },
              insertOrUpdate: {
                queries: isError === true ? [newQueryEnt] : []
              },
              insertOrDoNothing: {
                queries: isError === false ? [newQueryEnt] : []
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    query = await this.db.drizzle.query.queriesTable.findFirst({
      where: and(
        eq(queriesTable.queryId, newQuery.queryId),
        eq(queriesTable.projectId, newQuery.projectId)
      )
    });

    chartEnt.tiles[0].mconfigId = newMconfig.mconfigId;
    chartEnt.tiles[0].queryId = newMconfig.queryId;

    let payload: ToBackendSaveModifyChartResponsePayload = {
      chart: this.wrapToApiService.wrapToApiChart({
        chart: chartEnt,
        mconfigs: [
          this.wrapToApiService.wrapToApiMconfig({
            mconfig: newMconfig,
            modelFields: modelApi.fields
          })
        ],
        queries: [this.wrapToApiService.wrapToApiQuery(query)],
        member: this.wrapToApiService.wrapToApiMember(member),
        models: [modelApi],
        isAddMconfigAndQuery: true
      }),
      chartPart: this.wrapToApiService.wrapToApiChart({
        chart: chartEnt,
        mconfigs: [],
        queries: [],
        member: this.wrapToApiService.wrapToApiMember(member),
        models: [modelApi],
        isAddMconfigAndQuery: false
      })
    };

    return payload;
  }
}
