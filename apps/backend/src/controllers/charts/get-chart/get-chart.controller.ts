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
import { MalloyService } from '~backend/services/malloy.service';
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
export class GetChartController {
  constructor(
    private malloyService: MalloyService,
    private branchesService: BranchesService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private structsService: StructsService,
    private chartsService: ChartsService,
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private wrapToEntService: WrapToEntService,
    private rabbitService: RabbitService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetChart)
  async getChart(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetChartRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, isRepoProd, branchId, envId, chartId, timezone } =
      reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? common.PROD_REPO_ID : user.userId,
      branchId: branchId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
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

    let chart = await this.chartsService.getChartCheckExists({
      structId: bridge.structId,
      chartId: chartId
    });

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: userMember,
      entity: chart
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_CHART
      });
    }

    let chartMconfig = await this.mconfigsService.getMconfigCheckExists({
      structId: bridge.structId,
      mconfigId: chart.tiles[0].mconfigId
    });

    // console.log('getChart chartMconfig.select');
    // console.log(chartMconfig.select);

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: chartMconfig.modelId
    });

    let query;

    let newMconfig: common.Mconfig;
    let newQuery: common.Query;

    let isError = false;

    let isSearchExisting =
      model.type === common.ModelTypeEnum.SQL &&
      chartMconfig.timezone === timezone;

    // console.log('isSearchExisting');
    // console.log(isSearchExisting);

    if (isSearchExisting) {
      query = await this.queriesService.getQueryCheckExists({
        queryId: chartMconfig.queryId,
        projectId: projectId
      });
    } else {
      if (model.type === common.ModelTypeEnum.Store) {
        // if (model.isStoreModel === true) {
        let newMconfigId = common.makeId();
        let newQueryId = common.makeId();

        // biome-ignore format: theme breaks
        let sMconfig = Object.assign({}, chartMconfig, <schemaPostgres.MconfigEnt>{
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
      } else if (model.type === common.ModelTypeEnum.Malloy) {
        let queryOperation: common.QueryOperation = {
          type: common.QueryOperationTypeEnum.Get,
          timezone: timezone
        };

        let editMalloyQueryResult = await this.malloyService.editMalloyQuery({
          projectId: projectId,
          envId: envId,
          structId: struct.structId,
          model: model,
          mconfig: chartMconfig,
          queryOperations: [queryOperation]
        });

        newMconfig = editMalloyQueryResult.newMconfig;
        newQuery = editMalloyQueryResult.newQuery;
        isError = editMalloyQueryResult.isError;
      } else {
        let newMconfigId = common.makeId();
        let newQueryId = common.makeId();

        let { apiEnv, connectionsWithFallback } =
          await this.envsService.getApiEnvConnectionsWithFallback({
            projectId: projectId,
            envId: envId
          });

        // biome-ignore format: theme breaks
        let sendMconfig = Object.assign({}, chartMconfig, <schemaPostgres.MconfigEnt>{
          mconfigId: newMconfigId,
          queryId: newQueryId,
          timezone: timezone,
          temp: true
        });

        let toBlockmlProcessQueryRequest: apiToBlockml.ToBlockmlProcessQueryRequest =
          {
            info: {
              name: apiToBlockml.ToBlockmlRequestInfoNameEnum
                .ToBlockmlProcessQuery,
              traceId: traceId
            },
            payload: {
              projectId: project.projectId,
              weekStart: struct.weekStart,
              caseSensitiveStringFilters: struct.caseSensitiveStringFilters,
              simplifySafeAggregates: struct.simplifySafeAggregates,
              udfsDict: struct.udfsDict,
              mconfig: sendMconfig,
              modelContent: model.content,
              malloyModelDef: model.malloyModelDef,
              envId: envId,
              connections: connectionsWithFallback
            }
          };

        let blockmlProcessQueryResponse =
          await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlProcessQueryResponse>(
            {
              routingKey:
                common.RabbitBlockmlRoutingEnum.ProcessQuery.toString(),
              message: toBlockmlProcessQueryRequest,
              checkIsOk: true
            }
          );

        newMconfig = blockmlProcessQueryResponse.payload.mconfig;
        newQuery = blockmlProcessQueryResponse.payload.query;
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

      chart.tiles[0].mconfigId = newMconfig.mconfigId;
      chart.tiles[0].queryId = newMconfig.queryId;
    }

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let mconfig = isSearchExisting ? chartMconfig : newMconfig;

    // console.log('getChart mconfig.select');
    // console.log(mconfig.select);

    let payload: apiToBackend.ToBackendGetChartResponsePayload = {
      userMember: apiMember,
      chart: this.wrapToApiService.wrapToApiChart({
        chart: chart,
        mconfigs: [
          this.wrapToApiService.wrapToApiMconfig({
            mconfig: mconfig,
            modelFields: model.fields
          })
        ],
        queries: [this.wrapToApiService.wrapToApiQuery(query)],
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
