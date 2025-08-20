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

import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
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
import { getYYYYMMDDFromEpochUtcByTimezone } from '~node-common/functions/get-yyyymmdd-from-epoch-utc-by-timezone';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class CreateDraftChartController {
  constructor(
    private malloyService: MalloyService,
    private projectsService: ProjectsService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private bridgesService: BridgesService,
    private queriesService: QueriesService,
    private envsService: EnvsService,
    private wrapToEntService: WrapToEntService,
    private wrapToApiService: WrapToApiService,
    private mconfigsService: MconfigsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateDraftChart)
  async createDraftChart(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendCreateDraftChartRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      mconfig,
      isKeepQueryId,
      projectId,
      isRepoProd,
      branchId,
      envId,
      cellMetricsStartDateMs,
      cellMetricsEndDateMs,
      queryOperation
    } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let kQueryId = isKeepQueryId === true ? mconfig.queryId : undefined;

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
      throw new ServerError({
        message: ErEnum.BACKEND_STRUCT_ID_CHANGED
      });
    }

    let isAccessGranted = checkAccess({
      userAlias: user.alias,
      member: userMember,
      entity: model
    });

    if (isAccessGranted === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let newMconfig: Mconfig;
    let newQuery: Query;

    let isError = false;

    if (model.type === ModelTypeEnum.Store) {
      // if (model.isStoreModel === true) {

      // console.log('createMconfigAndQuery prepStoreMconfigQuery');

      let mqs = await this.mconfigsService.prepStoreMconfigQuery({
        struct: struct,
        project: project,
        envId: envId,
        model: model,
        mconfig: mconfig,
        metricsStartDateYYYYMMDD: isDefined(cellMetricsStartDateMs)
          ? getYYYYMMDDFromEpochUtcByTimezone({
              timezone: mconfig.timezone,
              secondsEpochUTC: cellMetricsStartDateMs / 1000
            })
          : undefined,
        metricsEndDateYYYYMMDD: isDefined(cellMetricsEndDateMs)
          ? getYYYYMMDDFromEpochUtcByTimezone({
              timezone: mconfig.timezone,
              secondsEpochUTC: cellMetricsEndDateMs / 1000
            })
          : undefined
      });

      isError = mqs.isError;

      newMconfig = mqs.newMconfig;

      if (isKeepQueryId === true && isError === false) {
        newMconfig.queryId = kQueryId;
      } else {
        newQuery = mqs.newQuery;
      }
    } else if (model.type === ModelTypeEnum.Malloy) {
      let editMalloyQueryResult = await this.malloyService.editMalloyQuery({
        projectId: projectId,
        envId: envId,
        structId: struct.structId,
        model: model,
        mconfig: mconfig,
        queryOperations: [queryOperation]
      });

      isError = editMalloyQueryResult.isError;
      newMconfig = editMalloyQueryResult.newMconfig;

      if (isKeepQueryId === true && isError === false) {
        newMconfig.queryId = kQueryId;
      } else {
        newQuery = editMalloyQueryResult.newQuery;
      }
    }

    let newQueryEnt =
      isKeepQueryId === true && isError === false
        ? await this.queriesService.getQueryCheckExists({
            queryId: newMconfig.queryId,
            projectId: projectId
          })
        : this.wrapToEntService.wrapToEntityQuery(newQuery);

    let newMconfigEnt = this.wrapToEntService.wrapToEntityMconfig(newMconfig);

    let chartId = makeId();

    let tile: Tile = {
      modelId: newMconfig.modelId,
      modelLabel: newMconfig.modelLabel,
      modelFilePath: newMconfig.modelFilePath,
      mconfigId: newMconfig.mconfigId,
      queryId: newMconfig.queryId,
      // malloyQueryId: undefined,
      listen: undefined,
      deletedFilterFieldIds: undefined,
      title: undefined,
      plateWidth: undefined,
      plateHeight: undefined,
      plateX: undefined,
      plateY: undefined
    };

    let newChart: Chart = {
      structId: bridge.structId,
      chartId: chartId,
      draft: true,
      creatorId: user.userId,
      title: chartId,
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
                charts: [newChartEnt],
                mconfigs: [newMconfigEnt]
              },
              insertOrUpdate: {
                queries: isError === true ? [newQueryEnt] : []
              },
              insertOrDoNothing: {
                queries:
                  isError === true || isKeepQueryId === true
                    ? []
                    : [newQueryEnt]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let query = await this.db.drizzle.query.queriesTable.findFirst({
      where: and(
        eq(queriesTable.queryId, newQueryEnt.queryId),
        eq(queriesTable.projectId, newQueryEnt.projectId)
      )
    });

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: ToBackendCreateDraftChartResponsePayload = {
      chart: this.wrapToApiService.wrapToApiChart({
        chart: newChartEnt,
        mconfigs: [
          this.wrapToApiService.wrapToApiMconfig({
            mconfig: newMconfigEnt,
            modelFields: model.fields
          })
        ],
        queries: [
          isDefined(query)
            ? this.wrapToApiService.wrapToApiQuery(query)
            : this.wrapToApiService.wrapToApiQuery(newQueryEnt)
        ],
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
