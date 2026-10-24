import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq, type SQL, sql } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendSuggestDimensionValuesRequestDto,
  ToBackendSuggestDimensionValuesResponseDto
} from '#backend/controllers/mconfigs/suggest-dimension-values/suggest-dimension-values.dto';
import { RunQueriesService } from '#backend/controllers/queries/run-queries/run-queries.service';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelFieldLeafsTable } from '#backend/drizzle/postgres/schema/model-field-leafs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { mconfigApiToTab } from '#backend/functions/db/mconfigs/mconfig-api-to-tab/mconfig-api-to-tab';
import { prepStoreMconfigQuery } from '#backend/functions/db/mconfigs/prep-store-mconfig-query/prep-store-mconfig-query';
import { checkRepoId } from '#backend/functions/db/sessions/check-repo-id/check-repo-id';
import { getStructCheckExistsAndNotChanged } from '#backend/functions/db/structs/get-struct-check-exists-and-not-changed/get-struct-check-exists-and-not-changed';
import { getYYYYMMDDFromEpochUtcByTimezone } from '#backend/functions/get-yyyymmdd-from-epoch-utc-by-timezone/get-yyyymmdd-from-epoch-utc-by-timezone';
import { checkParentAccess } from '#backend/functions/parent/check-parent-access/check-parent-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import { UTC } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import type { CachedColumnStatus } from '#common/types/backend/parts/connections/cached-column-status';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSuggestDimensionValuesOutput } from '#common/types/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-output';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import type { ModelType } from '#common/types/blockml/parts/model/model-type';

type PrepareParentPayload = {
  parentId?: string;
  parentType: MconfigParentType;
};

type CachedMatchedValueRow = { value?: string; count: number };

type CachedColumnRow = { cachedColumnFullId: string };

@ApiTags('Mconfigs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SuggestDimensionValuesController {
  constructor(
    private runQueriesService: RunQueriesService,
    private db: DbService,
    private cs: ConfigService<BackendConfig>
  ) {}

  @Post('api/ToBackendSuggestDimensionValues' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SuggestDimensionValues',
    description: 'Build a query to suggest values for a dimension'
  })
  @ApiOkResponse({ type: ToBackendSuggestDimensionValuesResponseDto })
  async suggestDimensionValues(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSuggestDimensionValuesRequestDto
  ): Promise<BackendResultForOperation<'suggestDimensionValues'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        structId: body.input.structId,
        modelId: body.input.modelId,
        fieldId: body.input.fieldId,
        chartId: body.input.chartId,
        dashboardId: body.input.dashboardId,
        reportId: body.input.reportId,
        rowId: body.input.rowId,
        term: body.input.term,
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
      Result.bind('struct', v =>
        getStructCheckExistsAndNotChanged({
          projectId: v.projectId,
          bridgeStructId: v.bridge.structId,
          structId: v.structId,
          cs: this.cs,
          db: this.db
        })
      ),
      Result.bind('prepareParentPayload', v => {
        let prepareParentPayload: PrepareParentPayload = {
          parentId: isDefined(v.dashboardId)
            ? v.dashboardId
            : isDefined(v.reportId)
              ? v.reportId
              : isDefined(v.chartId)
                ? v.chartId
                : undefined,
          parentType: isDefined(v.dashboardId)
            ? 'SuggestDimensionDashboard'
            : isDefined(v.reportId)
              ? 'SuggestDimensionReport'
              : isDefined(v.chartId)
                ? 'SuggestDimensionChart'
                : 'SuggestDimensionModel'
        };

        return Result.succeed(prepareParentPayload);
      }),
      Result.bind('model', v =>
        this.db.models.findFirstCheckExists({
          where: and(
            eq(modelsTable.structId, v.bridge.structId),
            eq(modelsTable.modelId, v.modelId)
          )
        })
      ),
      Result.andThrough(v =>
        checkParentAccess({
          parentId: v.prepareParentPayload.parentId,
          parentType: v.prepareParentPayload.parentType,
          modelId: v.modelId,
          user: v.user,
          userMember: v.userMember,
          structId: v.bridge.structId,
          projectId: v.projectId,
          isCheckSuggest: true,
          suggestFieldId: v.fieldId,
          suggestRowId: v.rowId,
          suggestModel: v.model,
          db: this.db
        })
      ),
      Result.bind('cachedValuesOutput', async v =>
        v.model.type === 'Malloy'
          ? this.getCachedValues({
              structId: v.struct.structId,
              modelId: v.modelId,
              fieldId: v.fieldId,
              projectId: v.projectId,
              envId: v.envId,
              term: v.term
            }).then(x => Result.succeed(x))
          : Result.succeed(undefined)
      ),
      Result.bind('apiMconfig', v => {
        if (v.model.type !== 'Store') {
          return Result.succeed(undefined);
        }

        let apiMconfig: Mconfig = {
          structId: v.bridge.structId,
          mconfigId: makeId(),
          queryId: makeId(),
          modelId: v.modelId,
          modelType: 'Store',
          parentType: v.prepareParentPayload.parentType,
          parentId: v.prepareParentPayload.parentId,
          dateRangeIncludesRightSide: undefined, // adjustMconfig overrides it
          storePart: undefined,
          modelLabel: v.model.label,
          modelFilePath: v.model.filePath,
          malloyQueryStable: undefined,
          malloyQueryExtra: undefined,
          compiledQuery: undefined,
          select: [v.fieldId],
          sortings: [],
          sorts: `${v.fieldId}`,
          timezone: UTC,
          limit: 500,
          filters: isDefinedAndNotEmpty(v.term)
            ? [
                {
                  fieldId: v.fieldId,
                  fractions: [
                    {
                      brick: `%${v.term}%`,
                      parentBrick: `%${v.term}%`,
                      type: 'StringContains',
                      operator: 'Or'
                    }
                  ]
                }
              ]
            : [],
          appliedGivens: undefined,
          chart: makeCopy(DEFAULT_CHART),
          serverTs: 1
        };

        return Result.succeed(apiMconfig);
      }),
      Result.bind('prepStoreMconfigQueryOutput', async v =>
        v.model.type !== 'Store'
          ? Result.succeed(undefined)
          : prepStoreMconfigQuery({
              struct: v.struct,
              project: v.project,
              envId: v.envId,
              model: v.model,
              mconfigParentType: v.apiMconfig.parentType,
              mconfigParentId: v.apiMconfig.parentId,
              mconfig: mconfigApiToTab({
                apiMconfig: v.apiMconfig
              }),
              metricsStartDateYYYYMMDD: isDefined(v.cellMetricsStartDateMs)
                ? getYYYYMMDDFromEpochUtcByTimezone({
                    timezone: v.apiMconfig.timezone,
                    secondsEpochUTC: v.cellMetricsStartDateMs / 1000
                  })
                : undefined,
              metricsEndDateYYYYMMDD: isDefined(v.cellMetricsEndDateMs)
                ? getYYYYMMDDFromEpochUtcByTimezone({
                    timezone: v.apiMconfig.timezone,
                    secondsEpochUTC: v.cellMetricsEndDateMs / 1000
                  })
                : undefined,
              db: this.db
            })
      ),
      Result.andThrough(v =>
        v.model.type !== 'Store'
          ? Result.succeed()
          : this.db.write({
              insert: {
                mconfigs: [v.prepStoreMconfigQueryOutput.newMconfig]
              },
              insertOrUpdate: {
                queries:
                  v.prepStoreMconfigQueryOutput.isError === true
                    ? [v.prepStoreMconfigQueryOutput.newQuery]
                    : []
              },
              insertOrDoNothing: {
                queries:
                  v.prepStoreMconfigQueryOutput.isError === true
                    ? []
                    : [v.prepStoreMconfigQueryOutput.newQuery]
              }
            })
      ),
      Result.andThrough(v =>
        v.model.type === 'Store' &&
        v.prepStoreMconfigQueryOutput.isError === false
          ? this.runQueriesService.runQueries({
              user: v.user,
              projectId: v.projectId,
              repoId: v.repoId,
              branchId: v.branchId,
              envId: v.envId,
              mconfigIds: [v.prepStoreMconfigQueryOutput.newMconfig.mconfigId],
              poolSize: 1
            })
          : Result.succeed()
      ),
      Result.bind('query', async v =>
        v.model.type !== 'Store'
          ? Result.succeed(undefined)
          : v.prepStoreMconfigQueryOutput.isError === false
            ? this.db.queries.findFirstCheckExists({
                where: and(
                  eq(
                    queriesTable.queryId,
                    v.prepStoreMconfigQueryOutput.newQuery.queryId
                  ),
                  eq(queriesTable.projectId, v.projectId)
                )
              })
            : Result.succeed(v.prepStoreMconfigQueryOutput.newQuery)
      ),
      Result.map(
        (v): ToBackendSuggestDimensionValuesOutput =>
          v.model.type === 'Malloy'
            ? v.cachedValuesOutput
            : v.model.type !== 'Store'
              ? { matchedValues: [] }
              : v.query.status === 'Error'
                ? {
                    matchedValues: [],
                    errorMessage:
                      v.query.lastErrorMessage ?? 'Suggest Values Error'
                  }
                : {
                    matchedValues: isDefined(v.query.data)
                      ? v.query.data.map((row: any) => ({
                          value: `${row[v.fieldId] ?? ''}`,
                          count: 0
                        }))
                      : []
                  }
      )
    );
  }

  private async getCachedValues(item: {
    structId: string;
    modelId: string;
    fieldId: string;
    projectId: string;
    envId: string;
    term?: string;
  }): Promise<ToBackendSuggestDimensionValuesOutput> {
    let { structId, modelId, fieldId, projectId, envId, term } = item;

    let rawCachedColumnsData: { rows: CachedColumnRow[] } =
      await this.db.drizzle.execute(sql`
SELECT
  cached_columns.cached_column_full_id AS "cachedColumnFullId"
FROM ${cachedColumnsTable} AS cached_columns
INNER JOIN ${modelFieldLeafsTable} AS model_field_leafs
  ON model_field_leafs.struct_id = ${structId}
  AND model_field_leafs.model_id = ${modelId}
  AND model_field_leafs.model_type = ${'Malloy' satisfies ModelType}
  AND model_field_leafs.field_id = ${fieldId}
  AND model_field_leafs.connection_id = cached_columns.connection_id
  AND model_field_leafs.schema_name_lc = cached_columns.schema_name_lc
  AND model_field_leafs.table_name_lc = cached_columns.table_name_lc
  AND model_field_leafs.column_name_lc = cached_columns.column_name_lc
WHERE cached_columns.project_id = ${projectId}
  AND cached_columns.env_id = ${envId}
  AND cached_columns.status = ${'completed' satisfies CachedColumnStatus}
LIMIT 1;
`);

    let cachedColumnRows: CachedColumnRow[] = rawCachedColumnsData.rows || [];

    if (cachedColumnRows.length === 0) {
      let output: ToBackendSuggestDimensionValuesOutput = {
        matchedValues: [],
        matchedValuesMessage: 'no cached values'
      };

      return output;
    }

    let termFilterSql: SQL = sql``;

    if (isDefinedAndNotEmpty(term)) {
      let termString: string = term ?? '';

      let escapedTerm: string = termString.replace(/[\\%_]/g, x => `\\${x}`);

      termFilterSql = sql`
    AND cached_parts.column_value_lc LIKE ${`%${escapedTerm.toLowerCase()}%`} ESCAPE '\'
`;
    }

    let rawData: { rows: CachedMatchedValueRow[] } =
      await this.db.drizzle.execute(sql`
SELECT
  cached_parts.column_value AS "value",
  cached_parts.count AS "count"
FROM ${cachedPartsTable} AS cached_parts
INNER JOIN ${modelFieldLeafsTable} AS model_field_leafs
  ON model_field_leafs.struct_id = ${structId}
  AND model_field_leafs.model_id = ${modelId}
  AND model_field_leafs.model_type = ${'Malloy' satisfies ModelType}
  AND model_field_leafs.field_id = ${fieldId}
  AND model_field_leafs.connection_id = cached_parts.connection_id
  AND model_field_leafs.schema_name_lc = cached_parts.schema_name_lc
  AND model_field_leafs.table_name_lc = cached_parts.table_name_lc
  AND model_field_leafs.column_name_lc = cached_parts.column_name_lc
WHERE cached_parts.project_id = ${projectId}
  AND cached_parts.env_id = ${envId}
  AND cached_parts.column_value IS NOT NULL
   ${termFilterSql}
ORDER BY cached_parts.count DESC, cached_parts.column_value ASC
LIMIT 500;
`);

    let rows: CachedMatchedValueRow[] = rawData.rows || [];

    let output: ToBackendSuggestDimensionValuesOutput = {
      matchedValues: rows.map(row => ({
        value: row.value ?? '',
        count: Number(row.count)
      }))
    };

    return output;
  }
}
