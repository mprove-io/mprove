import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendGroupMetricByDimensionRequestDto,
  ToBackendGroupMetricByDimensionResponseDto
} from '#backend/controllers/mconfigs/group-metric-by-dimension/group-metric-by-dimension.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BranchTab,
  BridgeTab,
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
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { getYYYYMMDDFromEpochUtcByTimezone } from '#backend/functions/get-yyyymmdd-from-epoch-utc-by-timezone/get-yyyymmdd-from-epoch-utc-by-timezone';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import type { PrepStoreMconfigQueryOutput } from '#backend/services/db/mconfigs/mconfigs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { MalloyService } from '#backend/services/malloy/malloy.service';
import { ParentService } from '#backend/services/parent/parent.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { setChartFields } from '#common/functions/set-chart-fields/set-chart-fields';
import { setChartTitleOnSelectChange } from '#common/functions/set-chart-title-on-select-change/set-chart-title-on-select-change';
import { sortChartFieldsOnSelectChange } from '#common/functions/sort-chart-fields-on-select-change/sort-chart-fields-on-select-change';
import { sortFieldsOnSelectChange } from '#common/functions/sort-fields-on-select-change/sort-fields-on-select-change';
import type { EditMalloyQueryError } from '#common/types/backend/function-errors/edit-malloy-query-error';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetMconfigCheckExistsError } from '#common/types/backend/function-errors/get-mconfig-check-exists-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetModelCheckExistsError } from '#common/types/backend/function-errors/get-model-check-exists-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetStructCheckExistsAndNotChangedError } from '#common/types/backend/function-errors/get-struct-check-exists-and-not-changed-error';
import type { PrepStoreMconfigQueryError } from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import type { QueryEntToTabError } from '#common/types/backend/function-errors/query-ent-to-tab-error';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { QueryOperation } from '#common/types/backend/parts/query-operation/query-operation';
import type { QueryOperationType } from '#common/types/backend/parts/query-operation/query-operation-type';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGroupMetricByDimensionOutput } from '#common/types/backend/routes/mconfigs/group-metric-by-dimension/group-metric-by-dimension-output';

type PrepareMconfigPayload = {
  apiMconfig: MconfigX;
  queryOperation?: QueryOperation;
};

type SelectSorting = {
  queryOperationType: QueryOperationType;
  sortFieldId: string;
  desc: boolean;
};

@ApiTags('Mconfigs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GroupMetricByDimensionController {
  constructor(
    private parentService: ParentService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private malloyService: MalloyService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGroupMetricByDimension' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GroupMetricByDimension',
    description: 'Group a metric by dimension'
  })
  @ApiOkResponse({
    type: ToBackendGroupMetricByDimensionResponseDto
  })
  async groupMetricByDimension(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGroupMetricByDimensionRequestDto
  ): Promise<BackendResultForOperation<'groupMetricByDimension'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        timezone: body.input.timezone,
        mconfigId: body.input.mconfigId,
        groupByFieldId: body.input.groupByFieldId,
        cellMetricsStartDateMs: body.input.cellMetricsStartDateMs,
        cellMetricsEndDateMs: body.input.cellMetricsEndDateMs,
        user: user
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
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.db.projects.findFirstCheckExists({
            where: eq(projectsTable.projectId, v.projectId)
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.db.members.findFirstCheckExists({
            where: and(
              eq(membersTable.memberId, v.user.userId),
              eq(membersTable.projectId, v.projectId)
            )
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
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
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsError> =>
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
        'oldMconfig',
        (v): Result.ResultAsync<MconfigTab, GetMconfigCheckExistsError> =>
          this.db.mconfigs.findFirstCheckExists({
            where: and(
              eq(mconfigsTable.mconfigId, v.mconfigId),
              eq(mconfigsTable.structId, v.bridge.structId)
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
            structId: v.oldMconfig.structId
          })
      ),
      Result.andThrough(v =>
        this.parentService.checkParentAccess({
          parentId: v.oldMconfig.parentId,
          parentType: v.oldMconfig.parentType,
          modelId: v.oldMconfig.modelId,
          user: v.user,
          userMember: v.userMember,
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      // Grouping does not require additional model access.
      Result.bind(
        'model',
        (v): Result.ResultAsync<ModelTab, GetModelCheckExistsError> =>
          this.db.models.findFirstCheckExists({
            where: and(
              eq(modelsTable.structId, v.bridge.structId),
              eq(modelsTable.modelId, v.oldMconfig.modelId)
            )
          })
      ),
      Result.bind(
        'prepareMconfigPayload',
        (v): Result.Result<PrepareMconfigPayload, never> => {
          let apiMconfig: MconfigX = this.mconfigsService.tabToApi({
            mconfig: v.oldMconfig,
            modelFields: v.model.fields
          });

          apiMconfig.timezone = v.timezone;

          let queryOperation: QueryOperation;

          if (apiMconfig.modelType === 'Malloy') {
            let selectSorting: SelectSorting = sortFieldsOnSelectChange({
              mconfig: apiMconfig,
              selectFieldId: v.groupByFieldId,
              modelFields: v.model.fields,
              mconfigFields: apiMconfig.fields
            });

            queryOperation = {
              type: selectSorting.queryOperationType,
              fieldId: v.groupByFieldId,
              sortFieldId: selectSorting.sortFieldId,
              desc: selectSorting.desc,
              timezone: apiMconfig.timezone
            };
          } else {
            apiMconfig.select = [...apiMconfig.select, v.groupByFieldId];

            apiMconfig = setChartTitleOnSelectChange({
              mconfig: apiMconfig,
              fields: v.model.fields
            });

            apiMconfig = setChartFields({
              mconfig: apiMconfig,
              fields: v.model.fields
            });

            apiMconfig = sortChartFieldsOnSelectChange({
              mconfig: apiMconfig,
              fields: v.model.fields
            });
          }

          return Result.succeed({
            apiMconfig: apiMconfig,
            queryOperation: queryOperation
          });
        }
      ),
      Result.bind(
        'mconfigQuery',
        (
          v
        ): Result.ResultAsync<
          PrepStoreMconfigQueryOutput,
          PrepStoreMconfigQueryError | EditMalloyQueryError
        > =>
          v.model.type === 'Store'
            ? this.mconfigsService.prepStoreMconfigQuery({
                struct: v.struct,
                project: v.project,
                envId: v.envId,
                model: v.model,
                mconfigParentType:
                  v.prepareMconfigPayload.apiMconfig.parentType,
                mconfigParentId: v.prepareMconfigPayload.apiMconfig.parentId,
                mconfig: this.mconfigsService.apiToTab({
                  apiMconfig: v.prepareMconfigPayload.apiMconfig
                }),
                metricsStartDateYYYYMMDD: isDefined(v.cellMetricsStartDateMs)
                  ? getYYYYMMDDFromEpochUtcByTimezone({
                      timezone: v.prepareMconfigPayload.apiMconfig.timezone,
                      secondsEpochUTC: v.cellMetricsStartDateMs / 1000
                    })
                  : undefined,
                metricsEndDateYYYYMMDD: isDefined(v.cellMetricsEndDateMs)
                  ? getYYYYMMDDFromEpochUtcByTimezone({
                      timezone: v.prepareMconfigPayload.apiMconfig.timezone,
                      secondsEpochUTC: v.cellMetricsEndDateMs / 1000
                    })
                  : undefined
              })
            : this.malloyService.editMalloyQuery({
                projectId: v.projectId,
                envId: v.envId,
                structId: v.struct.structId,
                mconfigParentType:
                  v.prepareMconfigPayload.apiMconfig.parentType,
                mconfigParentId: v.prepareMconfigPayload.apiMconfig.parentId,
                user: v.user,
                model: v.model,
                mconfig: this.mconfigsService.apiToTab({
                  apiMconfig: v.prepareMconfigPayload.apiMconfig
                }),
                queryOperations: [v.prepareMconfigPayload.queryOperation]
              })
      ),
      Result.andThrough(v =>
        this.db.write({
          insert: { mconfigs: [v.mconfigQuery.newMconfig] },
          insertOrUpdate: {
            queries:
              v.mconfigQuery.isError === true ? [v.mconfigQuery.newQuery] : []
          },
          insertOrDoNothing: {
            queries:
              v.mconfigQuery.isError === true ? [] : [v.mconfigQuery.newQuery]
          }
        })
      ),
      Result.bind(
        'query',
        (v): Result.ResultAsync<QueryTab, QueryEntToTabError> =>
          this.db.queries.findFirst({
            where: and(
              eq(queriesTable.queryId, v.mconfigQuery.newQuery.queryId),
              eq(queriesTable.projectId, v.mconfigQuery.newQuery.projectId)
            )
          })
      ),
      Result.map(
        (v): ToBackendGroupMetricByDimensionOutput => ({
          mconfig: this.mconfigsService.tabToApi({
            mconfig: v.mconfigQuery.newMconfig,
            modelFields: v.model.fields
          }),
          query: this.queriesService.tabToApi({
            query: isDefined(v.query) ? v.query : v.mconfigQuery.newQuery
          })
        })
      )
    );
  }
}
