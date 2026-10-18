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
import { type SQL, sql } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSuggestDimensionValuesRequestDto,
  ToBackendSuggestDimensionValuesResponseDto
} from '#backend/controllers/mconfigs/suggest-dimension-values/suggest-dimension-values.dto';
import { RunQueriesService } from '#backend/controllers/queries/run-queries/run-queries.service';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  ModelTab,
  ProjectTab,
  QueryTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { modelFieldLeafsTable } from '#backend/drizzle/postgres/schema/model-field-leafs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getYYYYMMDDFromEpochUtcByTimezone } from '#backend/functions/get-yyyymmdd-from-epoch-utc-by-timezone/get-yyyymmdd-from-epoch-utc-by-timezone';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import {
  MconfigsService,
  type PrepStoreMconfigQueryOutput
} from '#backend/services/db/mconfigs/mconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { ParentService } from '#backend/services/parent/parent.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import { UTC } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetModelCheckExistsError } from '#common/types/backend/function-errors/get-model-check-exists-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetQueryCheckExistsError } from '#common/types/backend/function-errors/get-query-check-exists-error';
import type { GetStructCheckExistsAndNotChangedError } from '#common/types/backend/function-errors/get-struct-check-exists-and-not-changed-error';
import type { PrepStoreMconfigQueryError } from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import type { CachedColumnStatus } from '#common/types/backend/parts/connections/cached-column-status';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSuggestDimensionValuesOutput } from '#common/types/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-output';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import type { ModelType } from '#common/types/blockml/parts/model/model-type';

type CachedMatchedValueRow = { value?: string; count: number };

type CachedColumnRow = { cachedColumnFullId: string };

type PrepareParentPayload = {
  parentId?: string;
  parentType: MconfigParentType;
};

@ApiTags('Mconfigs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SuggestDimensionValuesController {
  constructor(
    private parentService: ParentService,
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
    private runQueriesService: RunQueriesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
          this.projectsService.getProjectCheckExists({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.membersService.getMemberCheckExists({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.branchesService.getBranchCheckExists({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
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
          this.bridgesService.getBridgeCheckExists({
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
          this.structsService.getStructCheckExistsAndNotChanged({
            projectId: v.projectId,
            bridgeStructId: v.bridge.structId,
            structId: v.structId
          })
      ),
      Result.bind(
        'prepareParentPayload',
        (v): Result.Result<PrepareParentPayload, never> =>
          Result.succeed({
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
          })
      ),
      Result.bind(
        'model',
        (v): Result.ResultAsync<ModelTab, GetModelCheckExistsError> =>
          this.modelsService.getModelCheckExists({
            structId: v.bridge.structId,
            modelId: v.modelId
          })
      ),
      Result.andThrough(v =>
        this.parentService.checkParentAccess({
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
          suggestModel: v.model
        })
      ),
      Result.bind(
        'cachedValuesOutput',
        async (
          v
        ): Result.ResultAsync<ToBackendSuggestDimensionValuesOutput, never> =>
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
      Result.bind(
        'apiMconfig',
        (v): Result.Result<Mconfig, never> =>
          v.model.type !== 'Store'
            ? Result.succeed(undefined)
            : Result.succeed({
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
              })
      ),
      Result.bind(
        'prepStoreMconfigQueryOutput',
        async (
          v
        ): Result.ResultAsync<
          PrepStoreMconfigQueryOutput,
          PrepStoreMconfigQueryError
        > =>
          v.model.type !== 'Store'
            ? Result.succeed(undefined)
            : this.mconfigsService.prepStoreMconfigQuery({
                struct: v.struct,
                project: v.project,
                envId: v.envId,
                model: v.model,
                mconfigParentType: v.apiMconfig.parentType,
                mconfigParentId: v.apiMconfig.parentId,
                mconfig: this.mconfigsService.apiToTab({
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
                  : undefined
              })
      ),
      Result.andThrough(v =>
        v.model.type !== 'Store'
          ? Result.succeed()
          : dbErrorToResult({
              action: async (): Promise<void> => {
                await retry(
                  async () =>
                    this.db.drizzle.transaction(async tx =>
                      this.db.packer.write({
                        tx: tx,
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
                  getRetryOption(this.cs, this.logger)
                );
              }
            })
      ),
      Result.andThrough(v =>
        v.model.type === 'Store' &&
        v.prepStoreMconfigQueryOutput.isError === false
          ? this.runQueriesService.runQueriesResult({
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
      Result.bind(
        'query',
        async (v): Result.ResultAsync<QueryTab, GetQueryCheckExistsError> =>
          v.model.type !== 'Store'
            ? Result.succeed(undefined)
            : v.prepStoreMconfigQueryOutput.isError === false
              ? this.queriesService.getQueryCheckExists({
                  queryId: v.prepStoreMconfigQueryOutput.newQuery.queryId,
                  projectId: v.projectId
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
