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
import retry from 'async-retry';
import { sql } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSuggestDimensionValuesRequestDto,
  ToBackendSuggestDimensionValuesResponseDto
} from '#backend/controllers/mconfigs/suggest-dimension-values/suggest-dimension-values.dto';
import { RunQueriesService } from '#backend/controllers/queries/run-queries/run-queries.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { QueryTab, UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { modelFieldLeafsTable } from '#backend/drizzle/postgres/schema/model-field-leafs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { getYYYYMMDDFromEpochUtcByTimezone } from '#backend/functions/get-yyyymmdd-from-epoch-utc-by-timezone';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MconfigsService } from '#backend/services/db/mconfigs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { QueriesService } from '#backend/services/db/queries.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { StructsService } from '#backend/services/db/structs.service';
import { ParentService } from '#backend/services/parent.service';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import { UTC } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSuggestDimensionValuesOutput } from '#common/types/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-output';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';

type CachedMatchedValueRow = {
  value: string | null;
  count: number;
};

type CachedColumnRow = {
  cachedColumnFullId: string;
};

type MatchedValue = {
  value: string;
  count: number;
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
  @ApiOkResponse({
    type: ToBackendSuggestDimensionValuesResponseDto
  })
  async suggestDimensionValues(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSuggestDimensionValuesRequestDto
  ) {
    let { traceId } = body;
    let {
      projectId,
      repoId,
      branchId,
      envId,
      structId,
      modelId,
      fieldId,
      chartId,
      dashboardId,
      reportId,
      rowId,
      term,
      cellMetricsStartDateMs,
      cellMetricsEndDateMs
    } = body.input;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId,
      allowProdRepo: true
    });

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

    let struct = await this.structsService.getStructCheckExistsAndNotChanged({
      projectId: projectId,
      bridgeStructId: bridge.structId,
      structId: structId
    });

    let parentId = isDefined(dashboardId)
      ? dashboardId
      : isDefined(reportId)
        ? reportId
        : isDefined(chartId)
          ? chartId
          : undefined;

    let parentType: MconfigParentType = isDefined(dashboardId)
      ? 'SuggestDimensionDashboard'
      : isDefined(reportId)
        ? 'SuggestDimensionReport'
        : isDefined(chartId)
          ? 'SuggestDimensionChart'
          : 'SuggestDimensionModel';

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: modelId
    });

    await this.parentService.checkParentAccess({
      parentId: parentId,
      parentType: parentType,
      modelId: modelId,
      user: user,
      userMember: userMember,
      structId: bridge.structId,
      projectId: projectId,
      isCheckSuggest: true,
      suggestFieldId: fieldId,
      suggestRowId: rowId,
      suggestModel: model
    });

    if (model.type === 'Malloy') {
      // let temporaryPayload: ToBackendSuggestDimensionValuesOutput = {
      //   matchedValues: [],
      //   errorMessage: 'Temporary Malloy suggest error for UI testing'
      // };

      // return temporaryPayload;

      let rawCachedColumnsData: { rows: CachedColumnRow[] } =
        await this.db.drizzle.execute(sql`
SELECT
  cached_columns.cached_column_full_id AS "cachedColumnFullId"
FROM ${cachedColumnsTable} AS cached_columns
INNER JOIN ${modelFieldLeafsTable} AS model_field_leafs
  ON model_field_leafs.struct_id = ${struct.structId}
  AND model_field_leafs.model_id = ${modelId}
  AND model_field_leafs.model_type = ${'Malloy'}
  AND model_field_leafs.field_id = ${fieldId}
  AND model_field_leafs.connection_id = cached_columns.connection_id
  AND model_field_leafs.schema_name_lc = cached_columns.schema_name_lc
  AND model_field_leafs.table_name_lc = cached_columns.table_name_lc
  AND model_field_leafs.column_name_lc = cached_columns.column_name_lc
WHERE cached_columns.project_id = ${projectId}
  AND cached_columns.env_id = ${envId}
  AND cached_columns.status = 'completed'
LIMIT 1;
`);

      let cachedColumnRows = rawCachedColumnsData.rows || [];

      if (cachedColumnRows.length === 0) {
        let payload: ToBackendSuggestDimensionValuesOutput = {
          matchedValues: [],
          matchedValuesMessage: 'no cached values'
        };

        return payload;
      }

      let hasTerm = isDefinedAndNotEmpty(term);

      let termFilterSql = sql``;

      if (hasTerm === true) {
        let termString = term ?? '';

        let escapedTerm = termString.replace(/[\\%_]/g, x => `\\${x}`);

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
  ON model_field_leafs.struct_id = ${struct.structId}
  AND model_field_leafs.model_id = ${modelId}
  AND model_field_leafs.model_type = ${'Malloy'}
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

      let rows = rawData.rows || [];

      let payload: ToBackendSuggestDimensionValuesOutput = {
        matchedValues: rows.map(row => ({
          value: row.value ?? '',
          count: Number(row.count)
        }))
      };

      return payload;
    }

    if (model.type !== 'Store') {
      let payload: ToBackendSuggestDimensionValuesOutput = {
        matchedValues: []
      };

      return payload;
    }

    let apiMconfig: Mconfig = {
      structId: bridge.structId,
      mconfigId: makeId(),
      queryId: makeId(),
      modelId: modelId,
      modelType: 'Store',
      parentType: parentType,
      parentId: parentId,
      dateRangeIncludesRightSide: undefined, // adjustMconfig overrides it
      storePart: undefined,
      modelLabel: model.label,
      modelFilePath: model.filePath,
      malloyQueryStable: undefined,
      malloyQueryExtra: undefined,
      compiledQuery: undefined,
      select: [fieldId],
      sortings: [],
      sorts: `${fieldId}`,
      timezone: UTC,
      limit: 500,
      filters: isDefinedAndNotEmpty(term)
        ? [
            {
              fieldId: fieldId,
              fractions: [
                {
                  brick: `%${term}%`,
                  parentBrick: `%${term}%`,
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

    let newQuery: QueryTab;
    let isError = false;

    let mqe = await this.mconfigsService.prepStoreMconfigQuery({
      struct: struct,
      project: project,
      envId: envId,
      model: model,
      mconfigParentType: apiMconfig.parentType,
      mconfigParentId: apiMconfig.parentId,
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

    let newMconfig = mqe.newMconfig;
    newQuery = mqe.newQuery;
    isError = mqe.isError;

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
                queries: isError === true ? [] : [newQuery]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    if (isError === false) {
      await this.runQueriesService.runQueries({
        user: user,
        projectId: projectId,
        repoId: repoId,
        branchId: branchId,
        envId: envId,
        mconfigIds: [newMconfig.mconfigId],
        poolSize: 1
      });

      newQuery = await this.queriesService.getQueryCheckExists({
        queryId: newQuery.queryId,
        projectId: projectId
      });
    }

    if (newQuery.status === 'Error') {
      let payload: ToBackendSuggestDimensionValuesOutput = {
        matchedValues: [],
        errorMessage: newQuery.lastErrorMessage ?? 'Suggest Values Error'
      };

      return payload;
    }

    let matchedValues: MatchedValue[] = isDefined(newQuery.data)
      ? newQuery.data.map((row: any) => ({
          value: `${row[fieldId] ?? ''}`,
          count: 0
        }))
      : [];

    let payload: ToBackendSuggestDimensionValuesOutput = {
      matchedValues: matchedValues
    };

    return payload;
  }
}
