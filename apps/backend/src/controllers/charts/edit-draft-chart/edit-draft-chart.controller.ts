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
import { PROD_REPO_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { makeId } from '#common/functions/make-id';
import { Tile } from '#common/interfaces/blockml/tile';
import {
  ToBackendEditDraftChartRequest,
  ToBackendEditDraftChartResponsePayload
} from '#common/interfaces/to-backend/charts/to-backend-edit-draft-chart';
import { ServerError } from '#common/models/server-error';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { Db, DRIZZLE } from '~backend/drizzle/drizzle.module';
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

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditDraftChartController {
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
    private envsService: EnvsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private chartsService: ChartsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendEditDraftChart)
  async editDraftChart(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendEditDraftChartRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      mconfig: apiMconfig,
      projectId,
      isRepoProd,
      branchId,
      envId,
      chartId,
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

    let struct = await this.structsService.getStructCheckExistsAndNotChanged({
      projectId: projectId,
      bridgeStructId: bridge.structId,
      structId: apiMconfig.structId
    });

    let model = await this.modelsService.getModelCheckExistsAndAccess({
      structId: bridge.structId,
      modelId: apiMconfig.modelId,
      userMember: userMember
    });

    let chart = await this.chartsService.getChartCheckExists({
      structId: bridge.structId,
      chartId: chartId,
      userMember: userMember,
      user: user
    });

    if (chart.draft === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_CHART_IS_NOT_DRAFT
      });
    }

    let newMconfig: MconfigTab;
    let newQuery: QueryTab;

    let isError = false;

    if (model.type === ModelTypeEnum.Store) {
      let mqe = await this.mconfigsService.prepStoreMconfigQuery({
        struct: struct,
        project: project,
        envId: envId,
        mconfigParentType: MconfigParentTypeEnum.Chart,
        mconfigParentId: chartId,
        model: model,
        mconfig: this.mconfigsService.apiToTab({ apiMconfig: apiMconfig }),
        metricsStartDateYYYYMMDD: undefined,
        metricsEndDateYYYYMMDD: undefined
      });

      newMconfig = mqe.newMconfig;
      newQuery = mqe.newQuery;
      isError = mqe.isError;
    } else if (model.type === ModelTypeEnum.Malloy) {
      let editMalloyQueryResult = await this.malloyService.editMalloyQuery({
        projectId: projectId,
        envId: envId,
        structId: struct.structId,
        mconfigParentType: MconfigParentTypeEnum.Chart,
        mconfigParentId: chartId,
        model: model,
        mconfig: this.mconfigsService.apiToTab({ apiMconfig: apiMconfig }),
        queryOperations: [queryOperation]
      });

      newMconfig = editMalloyQueryResult.newMconfig;
      newQuery = editMalloyQueryResult.newQuery;
      isError = editMalloyQueryResult.isError;
    }

    let tile: Tile = {
      modelId: newMconfig.modelId,
      modelLabel: newMconfig.modelLabel,
      modelFilePath: newMconfig.modelFilePath,
      mconfigId: newMconfig.mconfigId,
      queryId: newQuery.queryId,
      trackChangeId: makeId(),
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
      structId: bridge.structId,
      chartId: chartId,
      chartType: newMconfig.chart.type,
      draft: true,
      creatorId: user.userId,
      title: chart.chartId,
      modelId: tile.modelId,
      modelLabel: tile.modelLabel,
      filePath: undefined,
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
                mconfigs: [newMconfig]
              },
              insertOrUpdate: {
                charts: [newChart],
                queries: isError === true ? [newQuery] : []
              },
              insertOrDoNothing: {
                queries: isError === true ? [] : [newQuery]
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

    let payload: ToBackendEditDraftChartResponsePayload = {
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
