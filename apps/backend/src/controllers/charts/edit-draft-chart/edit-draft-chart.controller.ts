import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendEditDraftChartRequestDto,
  ToBackendEditDraftChartResponseDto
} from '#backend/controllers/charts/edit-draft-chart/edit-draft-chart.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
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
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import type { ChartsCatalog } from '#backend/services/db/charts/charts.service';
import { ChartsService } from '#backend/services/db/charts/charts.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import type { PrepStoreMconfigQueryOutput } from '#backend/services/db/mconfigs/mconfigs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { HashService } from '#backend/services/hash/hash.service';
import type { EditMalloyQueryOutput } from '#backend/services/malloy/malloy.service';
import { MalloyService } from '#backend/services/malloy/malloy.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { DbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import type { EditMalloyQueryError } from '#common/types/backend/function-errors/edit-malloy-query-error';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetChartCheckExistsError } from '#common/types/backend/function-errors/get-chart-check-exists-error';
import type { GetChartsCatalogError } from '#common/types/backend/function-errors/get-charts-catalog-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetModelCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-model-check-exists-and-access-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetStructCheckExistsAndNotChangedError } from '#common/types/backend/function-errors/get-struct-check-exists-and-not-changed-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { PrepStoreMconfigQueryError } from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import type { QueryEntToTabError } from '#common/types/backend/function-errors/query-ent-to-tab-error';
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
    private sessionsService: SessionsService,
    private chartsService: ChartsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
        this.sessionsService.checkRepoIdResult({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.membersService.getMemberCheckExistsResult({
            projectId: v.projectId,
            memberId: v.user.userId
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
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.branchesService.getBranchCheckExistsResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccessResult({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsError> =>
          this.bridgesService.getBridgeCheckExistsResult({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
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
          this.structsService.getStructCheckExistsAndNotChangedResult({
            projectId: v.projectId,
            bridgeStructId: v.bridge.structId,
            structId: v.apiMconfig.structId
          })
      ),
      Result.bind(
        'model',
        (v): Result.ResultAsync<ModelTab, GetModelCheckExistsAndAccessError> =>
          this.modelsService.getModelCheckExistsAndAccessResult({
            structId: v.bridge.structId,
            modelId: v.apiMconfig.modelId,
            userMember: v.userMember
          })
      ),
      Result.bind(
        'chart',
        (v): Result.ResultAsync<ChartTab, GetChartCheckExistsError> =>
          this.chartsService.getChartCheckExistsResult({
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
          > = await this.mconfigsService.prepStoreMconfigQueryResult({
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
          > = await this.malloyService.editMalloyQueryResult({
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
        let persistenceResult: Result.Result<void, DbErrorToError> =
          await dbErrorToResult({
            action: async () => {
              await retry(
                async () =>
                  await this.db.drizzle.transaction(
                    async tx =>
                      await this.db.packer.write({
                        tx: tx,
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
                      })
                  ),
                getRetryOption(this.cs, this.logger)
              );
            }
          });

        if (Result.isFailure(persistenceResult)) {
          return persistenceResult;
        }

        return Result.succeed();
      }),
      Result.bind(
        'query',
        (v): Result.ResultAsync<QueryTab, QueryEntToTabError> =>
          this.db.drizzle.query.queriesTable
            .findFirst({
              where: and(
                eq(
                  queriesTable.queryId,
                  v.prepareQueryPayload.newQuery.queryId
                ),
                eq(
                  queriesTable.projectId,
                  v.prepareQueryPayload.newQuery.projectId
                )
              )
            })
            .then(x =>
              isUndefined(x)
                ? Result.succeed(undefined)
                : this.tabService.queryEntToTabResult({
                    queryEnt: x
                  })
            )
      ),
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind(
        'models',
        (v): Result.ResultAsync<ModelTab[], ModelEntToTabError> =>
          this.db.drizzle.query.modelsTable
            .findMany({ where: eq(modelsTable.structId, v.bridge.structId) })
            .then(xs =>
              Result.sequence(xs, x =>
                isUndefined(x)
                  ? Result.succeed(undefined)
                  : this.tabService.modelEntToTabResult({
                      modelEnt: x
                    })
              )
            )
      ),
      Result.bind(
        'chartsCatalog',
        (v): Result.ResultAsync<ChartsCatalog, GetChartsCatalogError> =>
          this.chartsService.getChartsCatalogResult({
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
