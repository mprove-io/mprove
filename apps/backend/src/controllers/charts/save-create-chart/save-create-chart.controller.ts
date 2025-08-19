import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';

import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '~backend/drizzle/postgres/schema/charts';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeChartFileText } from '~backend/functions/make-chart-file-text';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class SaveCreateChartController {
  constructor(
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private modelsService: ModelsService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private wrapToEntService: WrapToEntService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveCreateChart)
  async saveCreateChart(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendSaveCreateChartRequest = request.body;

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
      fromChartId,
      newChartId,
      tileTitle,
      accessRoles,
      mconfig,
      envId
    } = reqValid.payload;

    // console.log('saveCreateChart mconfig.select');
    // console.log(mconfig.select);

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
    });

    let firstProjectId =
      this.cs.get<BackendConfig['firstProjectId']>('firstProjectId');

    if (
      member.isAdmin === false &&
      projectId === firstProjectId &&
      repoId === PROD_REPO_ID
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_PROJECT
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

    let mdir = currentStruct.mproveDirValue;

    if (
      mdir.length > 2 &&
      mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH
    ) {
      mdir = mdir.substring(2);
    }

    let parentNodeId =
      currentStruct.mproveDirValue === MPROVE_CONFIG_DIR_DOT_SLASH
        ? `${projectId}/${MPROVE_USERS_FOLDER}/${user.alias}`
        : `${projectId}/${mdir}/${MPROVE_USERS_FOLDER}/${user.alias}`;

    let fileName = `${newChartId}${FileExtensionEnum.Chart}`;

    // let malloyQueryFileName =
    //   mconfig.modelType === ModelTypeEnum.Malloy
    //     ? `${newChartId}${FileExtensionEnum.Malloy}`
    //     : undefined;

    // let malloyChartFilePath =
    //   mconfig.modelType === ModelTypeEnum.Malloy
    //     ? `${parentNodeId}/${malloyQueryFileName}`
    //     : undefined;

    let {
      chartFileText
      // , malloyFileText
    } = makeChartFileText({
      mconfig: mconfig,
      tileTitle: tileTitle,
      roles: accessRoles,
      chartId: newChartId,
      modelId: mconfigModel.modelId,
      modelFilePath: mconfigModel.filePath
      // malloyChartFilePath: malloyChartFilePath
    });

    let toDiskCreateFileRequest: apiToDisk.ToDiskCreateFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        userAlias: user.alias,
        parentNodeId: parentNodeId,
        fileName: fileName,
        fileText: chartFileText,
        // secondFileName: isDefined(malloyFileText)
        //   ? malloyQueryFileName
        //   : undefined,
        // secondFileText: malloyFileText,
        remoteType: project.remoteType,
        gitUrl: project.gitUrl,
        privateKey: project.privateKey,
        publicKey: project.publicKey
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateFileResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
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

    let { charts, mconfigs, queries, struct } =
      await this.blockmlService.rebuildStruct({
        traceId: traceId,
        projectId: projectId,
        structId: bridge.structId,
        diskFiles: diskResponse.payload.files,
        mproveDir: diskResponse.payload.mproveDir,
        skipDb: true,
        envId: envId,
        overrideTimezone: undefined
      });

    let chart = charts.find(x => x.chartId === newChartId);

    if (isUndefined(chart)) {
      let fileId = `${parentNodeId}/${fileName}`;
      let fileIdAr = fileId.split('/');
      fileIdAr.shift();

      let filePath = fileIdAr.join('/');

      throw new ServerError({
        message: ErEnum.BACKEND_CREATE_CHART_FAIL,
        data: {
          encodedFileId: encodeFilePath({ filePath: filePath })
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
              charts: [chartEnt],
              mconfigs: [chartMconfig]
            },
            insertOrUpdate: {
              structs: [struct],
              bridges: [...branchBridges]
            },
            insertOrDoNothing: {
              queries: [chartQuery]
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let modelEnts = (await this.db.drizzle
      .select({
        modelId: modelsTable.modelId,
        accessRoles: modelsTable.accessRoles,
        hidden: modelsTable.hidden
      })
      .from(modelsTable)
      .where(eq(modelsTable.structId, bridge.structId))) as ModelEnt[];

    let payload: apiToBackend.ToBackendSaveCreateChartResponsePayload = {
      chart: this.wrapToApiService.wrapToApiChart({
        chart: chartEnt,
        mconfigs: [],
        queries: [],
        member: this.wrapToApiService.wrapToApiMember(member),
        models: modelEnts.map(model =>
          this.wrapToApiService.wrapToApiModel({
            model: model,
            hasAccess: checkAccess({
              userAlias: user.alias,
              member: member,
              entity: model
            })
          })
        ),
        isAddMconfigAndQuery: false
      })
    };

    return payload;
  }
}
