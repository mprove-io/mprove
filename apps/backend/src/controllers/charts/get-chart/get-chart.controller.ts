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
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { MconfigEnt } from '~backend/drizzle/postgres/schema/mconfigs';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { checkAccess } from '~backend/functions/check-access';
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
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { QueryOperationTypeEnum } from '~common/enums/query-operation-type.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import { QueryOperation } from '~common/interfaces/backend/query-operation';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Query } from '~common/interfaces/blockml/query';
import {
  ToBackendGetChartRequest,
  ToBackendGetChartResponsePayload
} from '~common/interfaces/to-backend/charts/to-backend-get-chart';
import { ServerError } from '~common/models/server-error';

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
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetChart)
  async getChart(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendGetChartRequest = request.body;

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
      repoId: isRepoProd === true ? PROD_REPO_ID : user.userId,
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

    let isAccessGranted = checkAccess({
      userAlias: user.alias,
      member: userMember,
      entity: chart
    });

    if (isAccessGranted === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_CHART
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

    let newMconfig: Mconfig;
    let newQuery: Query;

    let isError = false;

    let isSearchExisting = // TODO: check (was model.type === ModelTypeEnum.SQL)
      model.type !== ModelTypeEnum.Store &&
      model.type !== ModelTypeEnum.Malloy &&
      chartMconfig.timezone === timezone;

    // console.log('isSearchExisting');
    // console.log(isSearchExisting);

    if (isSearchExisting) {
      query = await this.queriesService.getQueryCheckExists({
        queryId: chartMconfig.queryId,
        projectId: projectId
      });
    } else {
      if (model.type === ModelTypeEnum.Store) {
        // if (model.isStoreModel === true) {
        let newMconfigId = makeId();
        let newQueryId = makeId();

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
        let queryOperation: QueryOperation = {
          type: QueryOperationTypeEnum.Get,
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

    let payload: ToBackendGetChartResponsePayload = {
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
            hasAccess: checkAccess({
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
