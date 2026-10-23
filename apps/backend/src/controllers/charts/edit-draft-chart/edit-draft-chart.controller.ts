import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendEditDraftChartRequestDto,
  ToBackendEditDraftChartResponseDto
} from '#backend/controllers/charts/edit-draft-chart/edit-draft-chart.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  ChartTab,
  MconfigTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { chartTabToApi } from '#backend/functions/db/charts/chart-tab-to-api/chart-tab-to-api';
import { getChartCheckExists } from '#backend/functions/db/charts/get-chart-check-exists/get-chart-check-exists';
import { getChartsCatalog } from '#backend/functions/db/charts/get-charts-catalog/get-charts-catalog';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { PrepStoreMconfigQueryOutput } from '#backend/services/db/mconfigs/mconfigs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { HashService } from '#backend/services/hash/hash.service';
import type { EditMalloyQueryOutput } from '#backend/services/malloy/malloy.service';
import { MalloyService } from '#backend/services/malloy/malloy.service';
import { SpaceService } from '#backend/services/space/space.service';
import { UnitsService } from '#backend/services/units/units.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import type { EditMalloyQueryError } from '#common/types/backend/function-errors/edit-malloy-query-error';
import type { PrepStoreMconfigQueryError } from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditDraftChartOutput } from '#common/types/backend/routes/charts/edit-draft-chart/edit-draft-chart-output';
import type { Tile } from '#common/types/blockml/parts/tile/tile';

type PrepareDraftChartPayload = {
  tile: Tile;
  newChart: ChartTab;
};

type PrepareQueryPayload = {
  newMconfig: MconfigTab;
  newQuery: QueryTab;
  isError: boolean;
};

@ApiTags('Charts')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditDraftChartController {
  constructor(
    private hashService: HashService,
    private malloyService: MalloyService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private structsService: StructsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private db: DbService,
    private unitsService: UnitsService,
    private spaceService: SpaceService
  ) {}

  @Post('api/ToBackendEditDraftChart' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'EditDraftChart',
    description: 'Edit a draft chart'
  })
  @ApiOkResponse({
    type: ToBackendEditDraftChartResponseDto
  })
  async editDraftChart(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditDraftChartRequestDto
  ): Promise<BackendResultForOperation<'editDraftChart'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        traceId: body.traceId,
        apiMconfig: body.input.mconfig,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        chartId: body.input.chartId,
        queryOperation: body.input.queryOperation
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.andThrough(v =>
        v.userMember.isExplorer === false
          ? Result.fail({
              code: 'BACKEND_MEMBER_IS_NOT_EXPLORER'
            })
          : Result.succeed()
      ),
      Result.bind('branch', v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.repoId),
            eq(branchesTable.branchId, v.branchId)
          )
        })
      ),
      Result.andThrough(v =>
        getEnvCheckExistsAndAccess({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind('bridge', v =>
        this.db.bridges.findFirstCheckExists({
          where: and(
            eq(bridgesTable.projectId, v.branch.projectId),
            eq(bridgesTable.repoId, v.branch.repoId),
            eq(bridgesTable.branchId, v.branch.branchId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.bind('struct', v =>
        this.structsService.getStructCheckExistsAndNotChanged({
          projectId: v.projectId,
          bridgeStructId: v.bridge.structId,
          structId: v.apiMconfig.structId
        })
      ),
      Result.bind('model', v =>
        this.modelsService.getModelCheckExistsAndAccess({
          structId: v.bridge.structId,
          modelId: v.apiMconfig.modelId,
          userMember: v.userMember
        })
      ),
      Result.bind('chart', v =>
        getChartCheckExists({
          db: this.db,
          structId: v.bridge.structId,
          chartId: v.chartId,
          userMember: v.userMember,
          user: v.user
        })
      ),
      Result.andThrough(v =>
        v.chart.draft === false
          ? Result.fail({
              code: 'BACKEND_CHART_IS_NOT_DRAFT'
            })
          : Result.succeed()
      ),
      Result.bind('prepareQueryPayload', v => {
        let newMconfig: MconfigTab;

        let newQuery: QueryTab;

        let isError: boolean = false;

        let prepareQueryPayload: PrepareQueryPayload = {
          newMconfig: newMconfig,
          newQuery: newQuery,
          isError: isError
        };

        return Result.succeed(prepareQueryPayload);
      }),
      Result.andThrough(async v => {
        if (v.model.type === 'Store') {
          let prepStoreMconfigQueryOutput: Result.Result<
            PrepStoreMconfigQueryOutput,
            PrepStoreMconfigQueryError
          > = await this.mconfigsService.prepStoreMconfigQuery({
            struct: v.struct,
            project: v.project,
            envId: v.envId,
            mconfigParentType: 'Chart',
            mconfigParentId: v.chartId,
            model: v.model,
            mconfig: this.mconfigsService.apiToTab({
              apiMconfig: v.apiMconfig
            }),
            metricsStartDateYYYYMMDD: undefined,
            metricsEndDateYYYYMMDD: undefined
          });

          if (Result.isFailure(prepStoreMconfigQueryOutput)) {
            return prepStoreMconfigQueryOutput;
          }

          let mqe: {
            isError: boolean;
            newMconfig: MconfigTab;
            newQuery: QueryTab;
          } = prepStoreMconfigQueryOutput.value;

          v.prepareQueryPayload.newMconfig = mqe.newMconfig;
          v.prepareQueryPayload.newQuery = mqe.newQuery;
          v.prepareQueryPayload.isError = mqe.isError;
        } else if (v.model.type === 'Malloy') {
          let editMalloyQueryOutput: Result.Result<
            EditMalloyQueryOutput,
            EditMalloyQueryError
          > = await this.malloyService.editMalloyQuery({
            projectId: v.projectId,
            envId: v.envId,
            structId: v.struct.structId,
            mconfigParentType: 'Chart',
            mconfigParentId: v.chartId,
            user: v.user,
            model: v.model,
            mconfig: this.mconfigsService.apiToTab({
              apiMconfig: v.apiMconfig
            }),
            queryOperations: [v.queryOperation]
          });

          if (Result.isFailure(editMalloyQueryOutput)) {
            return editMalloyQueryOutput;
          }

          let editMalloyQueryResult: {
            isError: boolean;
            newMconfig: MconfigTab;
            newQuery: QueryTab;
          } = editMalloyQueryOutput.value;

          v.prepareQueryPayload.newMconfig = editMalloyQueryResult.newMconfig;
          v.prepareQueryPayload.newQuery = editMalloyQueryResult.newQuery;
          v.prepareQueryPayload.isError = editMalloyQueryResult.isError;
        }

        return Result.succeed();
      }),
      Result.bind('prepareDraftChartPayload', v => {
        let tile: Tile = {
          modelId: v.prepareQueryPayload.newMconfig.modelId,
          modelLabel: v.prepareQueryPayload.newMconfig.modelLabel,
          modelFilePath: v.prepareQueryPayload.newMconfig.modelFilePath,
          mconfigId: v.prepareQueryPayload.newMconfig.mconfigId,
          queryId: v.prepareQueryPayload.newQuery.queryId,
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
            structId: v.bridge.structId,
            chartId: v.chartId
          }),
          structId: v.bridge.structId,
          chartId: v.chartId,
          chartType: v.prepareQueryPayload.newMconfig.chart.type,
          draft: true,
          isExplorer: undefined,
          sessionId: undefined,
          chartYaml: undefined,
          creatorId: v.user.userId,
          title: v.chart.chartId,
          modelId: tile.modelId,
          modelLabel: tile.modelLabel,
          filePath: undefined,
          space: undefined,
          accessRoles: [],
          accessRolesCombined: [],
          tiles: [tile],
          keyTag: undefined,
          serverTs: undefined
        };

        let prepareDraftChartPayload: PrepareDraftChartPayload = {
          tile: tile,
          newChart: newChart
        };

        return Result.succeed(prepareDraftChartPayload);
      }),
      Result.andThrough(async v => {
        let persistenceResult: Result.Result<void, WriteError> =
          await this.db.write({
            insert: {
              mconfigs: [v.prepareQueryPayload.newMconfig]
            },
            insertOrUpdate: {
              charts: [v.prepareDraftChartPayload.newChart],
              queries:
                v.prepareQueryPayload.isError === true
                  ? [v.prepareQueryPayload.newQuery]
                  : []
            },
            insertOrDoNothing: {
              queries:
                v.prepareQueryPayload.isError === true
                  ? []
                  : [v.prepareQueryPayload.newQuery]
            }
          });

        if (Result.isFailure(persistenceResult)) {
          return persistenceResult;
        }

        return Result.succeed();
      }),
      Result.bind('query', v =>
        this.db.queries.findFirst({
          where: and(
            eq(queriesTable.queryId, v.prepareQueryPayload.newQuery.queryId),
            eq(queriesTable.projectId, v.prepareQueryPayload.newQuery.projectId)
          )
        })
      ),
      Result.bind('apiUserMember', v =>
        Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind('models', v =>
        this.db.models.findMany({
          where: eq(modelsTable.structId, v.bridge.structId)
        })
      ),
      Result.bind('chartsCatalog', v =>
        getChartsCatalog({
          db: this.db,
          unitsService: this.unitsService,
          spaceService: this.spaceService,
          projectId: v.projectId,
          structId: v.bridge.structId,
          user: v.user,
          apiUserMember: v.apiUserMember,
          models: v.models,
          spaces: v.struct.spaces
        })
      ),
      Result.map(
        (v): ToBackendEditDraftChartOutput => ({
          chart: chartTabToApi({
            chart: v.prepareDraftChartPayload.newChart,
            mconfigs: [
              this.mconfigsService.tabToApi({
                mconfig: v.prepareQueryPayload.newMconfig,
                modelFields: v.model.fields
              })
            ],
            queries: [
              this.queriesService.tabToApi({
                query: isDefined(v.query)
                  ? v.query
                  : v.prepareQueryPayload.newQuery
              })
            ],
            member: v.apiUserMember,
            models: [
              this.modelsService.tabToApi({
                model: v.model,
                hasAccess: checkModelAccess({
                  member: v.userMember,
                  modelAccessRoles: v.model.accessRolesCombined
                })
              })
            ],
            isAddMconfigAndQuery: true
          }),
          chartUnitDrafts: v.chartsCatalog.chartUnitDrafts
        })
      )
    );
  }
}
