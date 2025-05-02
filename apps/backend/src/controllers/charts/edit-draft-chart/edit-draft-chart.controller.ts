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
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { ChartsService } from '~backend/services/charts.service';
import { EnvsService } from '~backend/services/envs.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
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
export class EditDraftChartController {
  constructor(
    private projectsService: ProjectsService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private wrapToEntService: WrapToEntService,
    private wrapToApiService: WrapToApiService,
    private mconfigsService: MconfigsService,
    private chartsService: ChartsService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditDraftChart)
  async editDraftChart(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendEditDraftChartRequest = request.body;

    let { traceId } = reqValid.info;
    let { mconfig, projectId, isRepoProd, branchId, envId, chartId } =
      reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

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

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: mconfig.modelId
    });

    if (mconfig.structId !== bridge.structId) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_STRUCT_ID_CHANGED
      });
    }

    let isAccessGrantedForModel = helper.checkAccess({
      userAlias: user.alias,
      member: userMember,
      entity: model
    });

    if (isAccessGrantedForModel === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let chart = await this.chartsService.getChartCheckExists({
      structId: bridge.structId,
      chartId: chartId
    });

    if (chart.draft === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_CHART_IS_NOT_DRAFT
      });
    }

    if (chart.creatorId !== user.userId) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_CHART_CREATOR_ID_MISMATCH
      });
    }

    let newMconfig: common.Mconfig;
    let newQuery: common.Query;

    let isError = false;

    if (model.isStoreModel === true) {
      // console.log('createMconfigAndQuery prepMconfigQuery');

      let mqe = await this.mconfigsService.prepMconfigQuery({
        struct: struct,
        project: project,
        envId: envId,
        model: model,
        mconfig: mconfig,
        metricsStartDateYYYYMMDD: undefined,
        metricsEndDateYYYYMMDD: undefined
      });

      newMconfig = mqe.newMconfig;
      newQuery = mqe.newQuery;
      isError = mqe.isError;
    } else {
      let toBlockmlProcessQueryRequest: apiToBlockml.ToBlockmlProcessQueryRequest =
        {
          info: {
            name: apiToBlockml.ToBlockmlRequestInfoNameEnum
              .ToBlockmlProcessQuery,
            traceId: traceId
          },
          payload: {
            orgId: project.orgId,
            projectId: project.projectId,
            weekStart: struct.weekStart,
            caseSensitiveStringFilters: struct.caseSensitiveStringFilters,
            simplifySafeAggregates: struct.simplifySafeAggregates,
            udfsDict: struct.udfsDict,
            mconfig: mconfig,
            modelContent: model.content,
            envId: envId
          }
        };

      let blockmlProcessQueryResponse =
        await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlProcessQueryResponse>(
          {
            routingKey: common.RabbitBlockmlRoutingEnum.ProcessQuery.toString(),
            message: toBlockmlProcessQueryRequest,
            checkIsOk: true
          }
        );

      newMconfig = blockmlProcessQueryResponse.payload.mconfig;
      newQuery = blockmlProcessQueryResponse.payload.query;
    }

    let newQueryEnt = this.wrapToEntService.wrapToEntityQuery(newQuery);
    let newMconfigEnt = this.wrapToEntService.wrapToEntityMconfig(newMconfig);

    let tile: common.Tile = {
      modelId: newMconfig.modelId,
      modelLabel: newMconfig.modelLabel,
      mconfigId: newMconfig.mconfigId,
      queryId: newQuery.queryId,
      listen: undefined,
      deletedFilterFieldIds: undefined,
      title: undefined,
      plateWidth: undefined,
      plateHeight: undefined,
      plateX: undefined,
      plateY: undefined
    };

    let newChart: common.Chart = {
      structId: bridge.structId,
      chartId: chartId,
      draft: true,
      creatorId: user.userId,
      title: chart.chartId,
      modelId: tile.modelId,
      modelLabel: tile.modelLabel,
      filePath: undefined,
      accessRoles: [],
      hidden: false,
      tiles: [tile],
      serverTs: undefined
    };

    let newChartEnt = this.wrapToEntService.wrapToEntityChart({
      chart: newChart,
      chartType: newMconfigEnt.chart.type
    });

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
                charts: [newChartEnt],
                queries: isError === true ? [newQueryEnt] : []
              },
              insertOrDoNothing: {
                queries: isError === true ? [] : [newQueryEnt]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let query = await this.db.drizzle.query.queriesTable.findFirst({
      where: and(
        eq(queriesTable.queryId, newQuery.queryId),
        eq(queriesTable.projectId, newQuery.projectId)
      )
    });

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendEditDraftChartResponsePayload = {
      chart: this.wrapToApiService.wrapToApiChart({
        chart: newChartEnt,
        mconfigs: [
          this.wrapToApiService.wrapToApiMconfig({
            mconfig: newMconfigEnt,
            modelFields: model.fields
          })
        ],
        queries: [
          common.isDefined(query)
            ? this.wrapToApiService.wrapToApiQuery(query)
            : this.wrapToApiService.wrapToApiQuery(newQueryEnt)
        ],
        member: apiMember,
        models: [
          this.wrapToApiService.wrapToApiModel({
            model: model,
            hasAccess: helper.checkAccess({
              userAlias: user.alias,
              member: userMember,
              entity: model
            })
          })
        ],
        isAddMconfigAndQuery: true
      })
    };

    return payload;
  }
}
