import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MconfigTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { ChartsService } from '#backend/services/db/charts.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MconfigsService } from '#backend/services/db/mconfigs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { QueriesService } from '#backend/services/db/queries.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { StructsService } from '#backend/services/db/structs.service';
import { MalloyService } from '#backend/services/malloy.service';
import { TabService } from '#backend/services/tab.service';
import { ErEnum } from '#common/enums/er.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { QueryOperationTypeEnum } from '#common/enums/query-operation-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { QueryOperation } from '#common/interfaces/backend/query-operation';
import {
  ToBackendGetChartRequest,
  ToBackendGetChartResponsePayload
} from '#common/interfaces/to-backend/charts/to-backend-get-chart';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetChartController {
  constructor(
    private tabService: TabService,
    private malloyService: MalloyService,
    private branchesService: BranchesService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private structsService: StructsService,
    private chartsService: ChartsService,
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetChart)
  async getChart(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetChartRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, repoId, branchId, envId, chartId, timezone } =
      reqValid.payload;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId
    });

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
      chartId: chartId,
      userMember: userMember,
      user: user
    });

    let chartMconfig = await this.mconfigsService.getMconfigCheckExists({
      structId: bridge.structId,
      mconfigId: chart.tiles[0].mconfigId
    });

    let model = await this.modelsService.getModelCheckExistsAndAccess({
      structId: bridge.structId,
      modelId: chartMconfig.modelId,
      userMember: userMember
    });

    let query: QueryTab;

    let newMconfig: MconfigTab;
    let newQuery: QueryTab;
    let isError = false;

    if (model.type === ModelTypeEnum.Store) {
      chartMconfig.timezone = timezone;

      let mqe = await this.mconfigsService.prepStoreMconfigQuery({
        struct: struct,
        project: project,
        envId: envId,
        mconfigParentType: chartMconfig.parentType,
        mconfigParentId: chartMconfig.parentId,
        model: model,
        mconfig: chartMconfig,
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
        mconfigParentType: chartMconfig.parentType,
        mconfigParentId: chartMconfig.parentId,
        model: model,
        mconfig: chartMconfig,
        queryOperations: [queryOperation]
      });

      newMconfig = editMalloyQueryResult.newMconfig;
      newQuery = editMalloyQueryResult.newQuery;
      isError = editMalloyQueryResult.isError;
    }

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
                queries: isError === true ? [newQuery] : []
              },
              insertOrDoNothing: {
                queries: isError === false ? [newQuery] : []
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    query = await this.db.drizzle.query.queriesTable
      .findFirst({
        where: and(
          eq(queriesTable.queryId, newQuery.queryId),
          eq(queriesTable.projectId, newQuery.projectId)
        )
      })
      .then(x => this.tabService.queryEntToTab(x));

    chart.tiles[0].mconfigId = newMconfig.mconfigId;
    chart.tiles[0].queryId = newMconfig.queryId;

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let payload: ToBackendGetChartResponsePayload = {
      userMember: apiUserMember,
      chart: this.chartsService.tabToApi({
        chart: chart,
        mconfigs: [
          this.mconfigsService.tabToApi({
            mconfig: newMconfig,
            modelFields: model.fields
          })
        ],
        queries: [this.queriesService.tabToApi({ query: query })],
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
