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
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '~backend/drizzle/postgres/schema/charts';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeChartFileText } from '~backend/functions/make-chart-file-text';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { ChartsService } from '~backend/services/charts.service';
import { EnvsService } from '~backend/services/envs.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { QueriesService } from '~backend/services/queries.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class SaveModifyChartController {
  constructor(
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
    private wrapToApiService: WrapToApiService,
    private queriesService: QueriesService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveModifyChart)
  async saveModifyChart(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendSaveModifyChartRequest = request.body;

    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_USER
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
      mconfig
    } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    if (member.isExplorer === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_IS_NOT_EXPLORER
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
      this.cs.get<interfaces.Config['firstProjectId']>('firstProjectId');

    if (
      member.isAdmin === false &&
      projectId === firstProjectId &&
      repoId === common.PROD_REPO_ID
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let existingChart = await this.chartsService.getChartCheckExists({
      structId: bridge.structId,
      chartId: chartId
    });

    if (common.isUndefined(mconfig)) {
      let mconfigEnt = await this.mconfigsService.getMconfigCheckExists({
        structId: bridge.structId,
        mconfigId: existingChart.tiles[0].mconfigId
      });

      let model = await this.modelsService.getModelCheckExists({
        structId: bridge.structId,
        modelId: mconfigEnt.modelId
      });

      mconfig = this.wrapToApiService.wrapToApiMconfig({
        mconfig: mconfigEnt,
        modelFields: model.fields
      });
    }

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

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: member,
      entity: mconfigModel
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let chartFileText = makeChartFileText({
      mconfig: mconfig,
      tileTitle: tileTitle,
      roles: accessRoles,
      chartId: chartId
    });

    let toDiskSaveFileRequest: apiToDisk.ToDiskSaveFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        fileNodeId: existingChart.filePath,
        userAlias: user.alias,
        content: chartFileText,
        remoteType: project.remoteType,
        gitUrl: project.gitUrl,
        privateKey: project.privateKey,
        publicKey: project.publicKey
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskSaveFileResponse>({
        routingKey: helper.makeRoutingKeyToDisk({
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
        x.structId = common.EMPTY_STRUCT_ID;
        x.needValidate = true;
      }
    });

    let { struct, charts, mconfigs, queries } =
      await this.blockmlService.rebuildStruct({
        traceId: traceId,
        orgId: project.orgId,
        projectId: projectId,
        structId: bridge.structId,
        diskFiles: diskResponse.payload.files,
        mproveDir: diskResponse.payload.mproveDir,
        skipDb: true,
        envId: envId,
        overrideTimezone: undefined
      });

    let chart = charts.find(x => x.chartId === chartId);

    if (common.isUndefined(chart)) {
      let fileIdAr = existingChart.filePath.split('/');
      fileIdAr.shift();
      let underscoreFileId = fileIdAr.join(common.TRIPLE_UNDERSCORE);

      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MODIFY_CHART_FAIL,
        data: {
          underscoreFileId: underscoreFileId
        }
      });
    }

    let chartTile = common.isDefined(chart) ? chart.tiles[0] : undefined;

    let chartMconfig = common.isDefined(chart)
      ? mconfigs.find(x => x.mconfigId === chartTile.mconfigId)
      : undefined;

    let chartQuery = common.isDefined(chart)
      ? queries.find(x => x.queryId === chartTile.queryId)
      : undefined;

    let chartEnt = common.isDefined(chart)
      ? this.wrapToEntService.wrapToEntityChart({
          chart: chart,
          chartType: chartMconfig.chart.type
        })
      : undefined;

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          if (common.isUndefined(chart)) {
            // because file chart changed
            await tx
              .delete(chartsTable)
              .where(
                and(
                  eq(chartsTable.chartId, chartId),
                  eq(chartsTable.structId, bridge.structId)
                )
              );
          }

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
              charts: common.isDefined(chart) ? [chartEnt] : undefined,
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

    let modelEnt = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: mconfig.modelId
    });

    let modelApi = this.wrapToApiService.wrapToApiModel({
      model: modelEnt,
      hasAccess: helper.checkAccess({
        userAlias: user.alias,
        member: member,
        entity: modelEnt
      })
    });

    let query = await this.queriesService.getQueryCheckExists({
      queryId: chartMconfig.queryId,
      projectId: projectId
    });

    let payload: apiToBackend.ToBackendSaveModifyChartResponsePayload = {
      chart: this.wrapToApiService.wrapToApiChart({
        chart: chartEnt,
        mconfigs: [
          this.wrapToApiService.wrapToApiMconfig({
            mconfig: chartMconfig,
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
