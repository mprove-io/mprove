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
import type { PackerOutput } from '#backend/drizzle/postgres/drizzle-packer';
import type {
  BranchTab,
  BridgeTab,
  ChartTab,
  MconfigTab,
  MemberTab,
  ModelTab,
  ProjectTab,
  QueryTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import type { ChartsCatalog } from '#backend/services/db/charts/charts.service';
import { ChartsService } from '#backend/services/db/charts/charts.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
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
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import type { DbBranchesFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/branches/db-branches-find-first-check-exists-error';
import type { DbBridgesFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/bridges/db-bridges-find-first-check-exists-error';
import type { DbMembersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';
import type { DbModelsFindManyError } from '#common/types/backend/function-errors/db/models/db-models-find-many-error';
import type { DbProjectsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/projects/db-projects-find-first-check-exists-error';
import type { DbQueriesFindFirstError } from '#common/types/backend/function-errors/db/queries/db-queries-find-first-error';
import type { EditMalloyQueryError } from '#common/types/backend/function-errors/edit-malloy-query-error';
import type { GetChartCheckExistsError } from '#common/types/backend/function-errors/get-chart-check-exists-error';
import type { GetChartsCatalogError } from '#common/types/backend/function-errors/get-charts-catalog-error';
import type { GetModelCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-model-check-exists-and-access-error';
import type { GetStructCheckExistsAndNotChangedError } from '#common/types/backend/function-errors/get-struct-check-exists-and-not-changed-error';
import type { PrepStoreMconfigQueryError } from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditDraftChartOutput } from '#common/types/backend/routes/charts/edit-draft-chart/edit-draft-chart-output';
import type { Tile } from '#common/types/blockml/parts/tile/tile';

type PrepareQueryPayload = {
  newMconfig: MconfigTab;
  newQuery: QueryTab;
  isError: boolean;
};

type PrepareDraftChartPayload = {
  tile: Tile;
  newChart: ChartTab;
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
    private envsService: EnvsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private chartsService: ChartsService,
    private db: DbService
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
      Result.bind(
        'project',
        (
          v
        ): Result.ResultAsync<
          ProjectTab,
          DbProjectsFindFirstCheckExistsError
        > =>
          this.db.projects.findFirstCheckExists({
            where: eq(projectsTable.projectId, v.projectId)
          })
      ),
      Result.bind(
        'userMember',
        (
          v
        ): Result.ResultAsync<MemberTab, DbMembersFindFirstCheckExistsError> =>
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
      Result.bind(
        'branch',
        (
          v
        ): Result.ResultAsync<BranchTab, DbBranchesFindFirstCheckExistsError> =>
          this.db.branches.findFirstCheckExists({
            where: and(
              eq(branchesTable.projectId, v.projectId),
              eq(branchesTable.repoId, v.repoId),
              eq(branchesTable.branchId, v.branchId)
            )
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccess({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'bridge',
        (
          v
        ): Result.ResultAsync<BridgeTab, DbBridgesFindFirstCheckExistsError> =>
          this.db.bridges.findFirstCheckExists({
            where: and(
              eq(bridgesTable.projectId, v.branch.projectId),
              eq(bridgesTable.repoId, v.branch.repoId),
              eq(bridgesTable.branchId, v.branch.branchId),
              eq(bridgesTable.envId, v.envId)
            )
          })
      ),
      Result.bind(
        'struct',
        (
          v
        ): Result.ResultAsync<
          StructTab,
          GetStructCheckExistsAndNotChangedError
        > =>
          this.structsService.getStructCheckExistsAndNotChanged({
            projectId: v.projectId,
            bridgeStructId: v.bridge.structId,
            structId: v.apiMconfig.structId
          })
      ),
      Result.bind(
        'model',
        (v): Result.ResultAsync<ModelTab, GetModelCheckExistsAndAccessError> =>
          this.modelsService.getModelCheckExistsAndAccess({
            structId: v.bridge.structId,
            modelId: v.apiMconfig.modelId,
            userMember: v.userMember
          })
      ),
      Result.bind(
        'chart',
        (v): Result.ResultAsync<ChartTab, GetChartCheckExistsError> =>
          this.chartsService.getChartCheckExists({
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
      Result.bind(
        'prepareQueryPayload',
        (v): Result.Result<PrepareQueryPayload, never> => {
          let newMconfig: MconfigTab;

          let newQuery: QueryTab;

          let isError: boolean = false;

          return Result.succeed({
            newMconfig: newMconfig,
            newQuery: newQuery,
            isError: isError
          });
        }
      ),
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
      Result.bind(
        'prepareDraftChartPayload',
        (v): Result.Result<PrepareDraftChartPayload, never> => {
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

          return Result.succeed({ tile: tile, newChart: newChart });
        }
      ),
      Result.andThrough(async v => {
        let persistenceResult: Result.Result<PackerOutput, WriteError> =
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
      Result.bind(
        'query',
        (v): Result.ResultAsync<QueryTab, DbQueriesFindFirstError> =>
          this.db.queries.findFirst({
            where: and(
              eq(queriesTable.queryId, v.prepareQueryPayload.newQuery.queryId),
              eq(
                queriesTable.projectId,
                v.prepareQueryPayload.newQuery.projectId
              )
            )
          })
      ),
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind(
        'models',
        (v): Result.ResultAsync<ModelTab[], DbModelsFindManyError> =>
          this.db.models.findMany({
            where: eq(modelsTable.structId, v.bridge.structId)
          })
      ),
      Result.bind(
        'chartsCatalog',
        (v): Result.ResultAsync<ChartsCatalog, GetChartsCatalogError> =>
          this.chartsService.getChartsCatalog({
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
          chart: this.chartsService.tabToApi({
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
