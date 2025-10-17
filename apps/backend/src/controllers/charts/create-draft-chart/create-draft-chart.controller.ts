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
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  ChartTab,
  MconfigTab,
  QueryTab,
  UserTab
} from '~backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { checkModelAccess } from '~backend/functions/check-model-access';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
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
import { HashService } from '~backend/services/hash.service';
import { MalloyService } from '~backend/services/malloy.service';
import { TabService } from '~backend/services/tab.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { QueryParentTypeEnum } from '~common/enums/query-parent-type.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { makeId } from '~common/functions/make-id';
import { Tile } from '~common/interfaces/blockml/tile';
import {
  ToBackendCreateDraftChartRequest,
  ToBackendCreateDraftChartResponsePayload
} from '~common/interfaces/to-backend/charts/to-backend-create-draft-chart';
import { ServerError } from '~common/models/server-error';
import { getYYYYMMDDFromEpochUtcByTimezone } from '~node-common/functions/get-yyyymmdd-from-epoch-utc-by-timezone';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateDraftChartController {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private malloyService: MalloyService,
    private projectsService: ProjectsService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private bridgesService: BridgesService,
    private queriesService: QueriesService,
    private envsService: EnvsService,
    private mconfigsService: MconfigsService,
    private chartsService: ChartsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateDraftChart)
  async createDraftChart(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendCreateDraftChartRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      mconfig: apiMconfig,
      // isKeepQueryId,
      projectId,
      isRepoProd,
      branchId,
      envId,
      cellMetricsStartDateMs,
      cellMetricsEndDateMs,
      queryOperation
    } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

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
      modelId: apiMconfig.modelId
    });

    if (apiMconfig.structId !== bridge.structId) {
      throw new ServerError({
        message: ErEnum.BACKEND_STRUCT_ID_CHANGED
      });
    }

    let isAccessGrantedForModel = checkModelAccess({
      member: userMember,
      modelAccessRoles: model.accessRoles
    });

    if (isAccessGrantedForModel === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let chartId = makeId();

    let newMconfig: MconfigTab;
    let newQuery: QueryTab;

    let isError = false;

    if (model.type === ModelTypeEnum.Store) {
      let mqs = await this.mconfigsService.prepStoreMconfigQuery({
        struct: struct,
        project: project,
        envId: envId,
        queryParentType: QueryParentTypeEnum.Chart,
        queryParentId: chartId,
        model: model,
        mconfig: this.mconfigsService.apiToTab({ apiMconfig: apiMconfig }),
        metricsStartDateYYYYMMDD: isDefined(cellMetricsStartDateMs)
          ? getYYYYMMDDFromEpochUtcByTimezone({
              timezone: apiMconfig.timezone,
              secondsEpochUTC: cellMetricsStartDateMs / 1000
            })
          : undefined,
        metricsEndDateYYYYMMDD: isDefined(cellMetricsEndDateMs)
          ? getYYYYMMDDFromEpochUtcByTimezone({
              timezone: apiMconfig.timezone,
              secondsEpochUTC: cellMetricsEndDateMs / 1000
            })
          : undefined
      });

      newMconfig = mqs.newMconfig;
      newQuery = mqs.newQuery;
      isError = mqs.isError;
    } else if (model.type === ModelTypeEnum.Malloy) {
      let editMalloyQueryResult = await this.malloyService.editMalloyQuery({
        projectId: projectId,
        envId: envId,
        structId: struct.structId,
        queryParentType: QueryParentTypeEnum.Chart,
        queryParentId: chartId,
        model: model,
        mconfig: this.mconfigsService.apiToTab({ apiMconfig: apiMconfig }),
        queryOperations: isDefined(queryOperation) ? [queryOperation] : []
      });

      newMconfig = editMalloyQueryResult.newMconfig;
      newQuery = editMalloyQueryResult.newQuery;
      isError = editMalloyQueryResult.isError;
    }

    // if (isKeepQueryId === true && isError === false) {
    //   newMconfig.queryId = apiMconfig.queryId;

    //   newQuery = await this.queriesService.getQueryCheckExists({
    //     queryId: newMconfig.queryId,
    //     projectId: projectId
    //   });
    // }

    let tile: Tile = {
      modelId: newMconfig.modelId,
      modelLabel: newMconfig.modelLabel,
      modelFilePath: newMconfig.modelFilePath,
      mconfigId: newMconfig.mconfigId,
      queryId: newMconfig.queryId,
      trackChangeId: makeId(),
      // malloyQueryId: undefined,
      listen: undefined,
      deletedFilterFieldIds: undefined,
      title: undefined,
      plateWidth: undefined,
      plateHeight: undefined,
      plateX: undefined,
      plateY: undefined
    };

    let newChart: ChartTab = {
      chartFullId: this.hashService.makeChartFullId({
        structId: bridge.structId,
        chartId: chartId
      }),
      chartType: newMconfig.chart.type,
      structId: bridge.structId,
      chartId: chartId,
      draft: true,
      creatorId: user.userId,
      title: chartId,
      modelId: tile.modelId,
      modelLabel: tile.modelLabel,
      filePath: undefined,
      accessRoles: [],
      tiles: [tile],
      keyTag: undefined,
      serverTs: undefined
    };

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                charts: [newChart],
                mconfigs: [newMconfig]
              },
              insertOrUpdate: {
                queries: isError === true ? [newQuery] : []
              },
              insertOrDoNothing: {
                queries:
                  isError === true
                    ? // || isKeepQueryId === true
                      []
                    : [newQuery]
              }
            })
        ),
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

    let payload: ToBackendCreateDraftChartResponsePayload = {
      chart: this.chartsService.tabToApi({
        chart: newChart,
        mconfigs: [
          this.mconfigsService.tabToApi({
            mconfig: newMconfig,
            modelFields: model.fields
          })
        ],
        queries: [
          this.queriesService.tabToApi({
            query: isDefined(query) ? query : newQuery
          })
        ],
        member: apiUserMember,
        models: [
          this.modelsService.tabToApi({
            model: model,
            hasAccess: checkModelAccess({
              member: userMember,
              modelAccessRoles: model.accessRoles
            })
          })
        ],
        isAddMconfigAndQuery: true
      })
    };

    return payload;
  }
}
