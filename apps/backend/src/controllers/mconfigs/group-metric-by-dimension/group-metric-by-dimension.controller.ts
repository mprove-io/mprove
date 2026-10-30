import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendGroupMetricByDimensionRequestDto,
  ToBackendGroupMetricByDimensionResponseDto
} from '#backend/controllers/mconfigs/group-metric-by-dimension/group-metric-by-dimension.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { mconfigsTable } from '#backend/drizzle/postgres/tables/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { mconfigApiToTab } from '#backend/functions/db/mconfigs/mconfig-api-to-tab/mconfig-api-to-tab';
import { mconfigTabToApi } from '#backend/functions/db/mconfigs/mconfig-tab-to-api/mconfig-tab-to-api';
import { prepStoreMconfigQuery } from '#backend/functions/db/mconfigs/prep-store-mconfig-query/prep-store-mconfig-query';
import { queryTabToApi } from '#backend/functions/db/queries/query-tab-to-api/query-tab-to-api';
import { getStructCheckExistsAndNotChanged } from '#backend/functions/db/structs/get-struct-check-exists-and-not-changed/get-struct-check-exists-and-not-changed';
import { getYYYYMMDDFromEpochUtcByTimezone } from '#backend/functions/get-yyyymmdd-from-epoch-utc-by-timezone/get-yyyymmdd-from-epoch-utc-by-timezone';
import { editMalloyQuery } from '#backend/functions/malloy/edit-malloy-query/edit-malloy-query';
import { checkParentAccess } from '#backend/functions/parent/check-parent-access/check-parent-access';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { setChartFields } from '#common/functions/set-chart-fields/set-chart-fields';
import { setChartTitleOnSelectChange } from '#common/functions/set-chart-title-on-select-change/set-chart-title-on-select-change';
import { sortChartFieldsOnSelectChange } from '#common/functions/sort-chart-fields-on-select-change/sort-chart-fields-on-select-change';
import { sortFieldsOnSelectChange } from '#common/functions/sort-fields-on-select-change/sort-fields-on-select-change';
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
    private db: DbService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
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
        checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true,
          db: this.db
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
      Result.bind('oldMconfig', v =>
        this.db.mconfigs.findFirstCheckExists({
          where: and(
            eq(mconfigsTable.mconfigId, v.mconfigId),
            eq(mconfigsTable.structId, v.bridge.structId)
          )
        })
      ),
      Result.bind('struct', v =>
        getStructCheckExistsAndNotChanged({
          projectId: v.projectId,
          bridgeStructId: v.bridge.structId,
          structId: v.oldMconfig.structId,
          cs: this.cs,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        checkParentAccess({
          parentId: v.oldMconfig.parentId,
          parentType: v.oldMconfig.parentType,
          modelId: v.oldMconfig.modelId,
          user: v.user,
          userMember: v.userMember,
          structId: v.bridge.structId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      // Grouping does not require additional model access.
      Result.bind('model', v =>
        this.db.models.findFirstCheckExists({
          where: and(
            eq(modelsTable.structId, v.bridge.structId),
            eq(modelsTable.modelId, v.oldMconfig.modelId)
          )
        })
      ),
      Result.bind('prepareMconfigPayload', v => {
        let apiMconfig: MconfigX = mconfigTabToApi({
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

        let prepareMconfigPayload: PrepareMconfigPayload = {
          apiMconfig: apiMconfig,
          queryOperation: queryOperation
        };

        return Result.succeed(prepareMconfigPayload);
      }),
      Result.bind('mconfigQuery', v =>
        v.model.type === 'Store'
          ? prepStoreMconfigQuery({
              struct: v.struct,
              project: v.project,
              envId: v.envId,
              model: v.model,
              mconfigParentType: v.prepareMconfigPayload.apiMconfig.parentType,
              mconfigParentId: v.prepareMconfigPayload.apiMconfig.parentId,
              mconfig: mconfigApiToTab({
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
                : undefined,
              db: this.db
            })
          : editMalloyQuery({
              projectId: v.projectId,
              envId: v.envId,
              structId: v.struct.structId,
              mconfigParentType: v.prepareMconfigPayload.apiMconfig.parentType,
              mconfigParentId: v.prepareMconfigPayload.apiMconfig.parentId,
              user: v.user,
              model: v.model,
              mconfig: mconfigApiToTab({
                apiMconfig: v.prepareMconfigPayload.apiMconfig
              }),
              queryOperations: [v.prepareMconfigPayload.queryOperation],
              db: this.db,
              logger: this.logger,
              cs: this.cs
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
      Result.bind('query', v =>
        this.db.queries.findFirst({
          where: and(
            eq(queriesTable.queryId, v.mconfigQuery.newQuery.queryId),
            eq(queriesTable.projectId, v.mconfigQuery.newQuery.projectId)
          )
        })
      ),
      Result.map(
        (v): ToBackendGroupMetricByDimensionOutput => ({
          mconfig: mconfigTabToApi({
            mconfig: v.mconfigQuery.newMconfig,
            modelFields: v.model.fields
          }),
          query: queryTabToApi({
            query: isDefined(v.query) ? v.query : v.mconfigQuery.newQuery
          })
        })
      )
    );
  }
}
