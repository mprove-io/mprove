import { Inject, Injectable } from '@nestjs/common';
import { type Tool, tool } from 'ai';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { modelFieldLeafsTable } from '#backend/drizzle/postgres/schema/model-field-leafs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { CachedColumnService } from '#backend/services/db/cached-column.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { TabService } from '#backend/services/tab.service';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';

type CachedUniqueValueSearchMatch = {
  connectionId: string;
  schemaName: string;
  tableName: string;
  columnName: string;
  modelIds: string[];
  matchedValues: { value: string; count: number }[];
};

type CachedUniqueValueSearchResult = {
  searchText: string;
  matchFields: CachedUniqueValueSearchMatch[];
}[];

type CachedUniqueValueSearchRow = {
  searchText: string;
  connectionId: string;
  schemaName: string;
  tableName: string;
  columnName: string;
  value: string | null;
  count: number;
  modelIds: string[];
};

export const UNIQUE_VALUES_SEARCH_TEXTS_LIMIT = 10;
export const UNIQUE_VALUES_MATCH_FIELDS_LIMIT = 30;
export const UNIQUE_VALUES_MATCH_VALUES_LIMIT = 20;

@Injectable()
export class SearchCachedUniqueValuesToolService {
  constructor(
    private cachedColumnService: CachedColumnService,
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  makeTool(item: {
    user: UserTab;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }): Tool {
    let { user, projectId, repoId, branchId, envId } = item;

    return tool({
      description: `Search cached unique values to identify which database fields may contain user-mentioned values. 
Use this tool when a question references ambiguous literals and you need to find the right fields.
Prefer exact distinctive values (up to ${UNIQUE_VALUES_SEARCH_TEXTS_LIMIT}) over broad words or generated synonyms.
The tool will return up to ${UNIQUE_VALUES_MATCH_VALUES_LIMIT} values per matched field, up to ${UNIQUE_VALUES_MATCH_FIELDS_LIMIT} matched fields per search text, and modelIds for Mprove models that use each field.`,
      inputSchema: z.object({
        searchTexts: z
          .array(z.string())
          .min(1)
          .max(UNIQUE_VALUES_SEARCH_TEXTS_LIMIT)
          .describe(
            `One to ${UNIQUE_VALUES_SEARCH_TEXTS_LIMIT} value texts to search for in cached unique values.`
          )
      }),
      execute: async input => {
        let result = await this.searchCachedUniqueValues({
          user: user,
          projectId: projectId,
          repoId: repoId,
          branchId: branchId,
          envId: envId,
          searchTexts: input.searchTexts
        });

        return result;
      }
    });
  }

  private async searchCachedUniqueValues(item: {
    user: UserTab;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    searchTexts: string[];
  }): Promise<CachedUniqueValueSearchResult> {
    let { user, projectId, repoId, branchId, envId, searchTexts } = item;

    let trimmedSearchTexts = searchTexts
      .map(searchText => searchText.trim())
      .filter(searchText => searchText.length > 0);

    let isSearchTextsEmpty = trimmedSearchTexts.length === 0;

    if (isSearchTextsEmpty) {
      return [];
    }

    await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId,
      allowProdRepo: true
    });

    await this.projectsService.getProjectCheckExists({ projectId: projectId });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let modelTabs = await this.db.drizzle.query.modelsTable
      .findMany({
        where: eq(modelsTable.structId, bridge.structId)
      })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let accessibleMalloyModelIds = modelTabs
      .filter(model =>
        checkModelAccess({
          member: userMember,
          modelAccessRoles: model.accessRoles
        })
      )
      .filter(model => model.type === ModelTypeEnum.Malloy)
      .map(model => model.modelId);

    let hasAccessibleMalloyModels = accessibleMalloyModelIds.length > 0;
    let result: CachedUniqueValueSearchResult;

    if (hasAccessibleMalloyModels === true) {
      let cacheEnvId = await this.cachedColumnService.getCacheEnvId({
        projectId: projectId,
        envId: envId
      });

      result = await this.searchCachedUniqueValueFields({
        projectId: projectId,
        structId: bridge.structId,
        cacheEnvId: cacheEnvId,
        searchTexts: trimmedSearchTexts,
        modelIds: accessibleMalloyModelIds
      });
    } else {
      result = trimmedSearchTexts.map(searchText => {
        let matchFields: CachedUniqueValueSearchMatch[] = [];

        return {
          searchText: searchText,
          matchFields: matchFields
        };
      });
    }

    return result;
  }

  private async searchCachedUniqueValueFields(item: {
    projectId: string;
    structId: string;
    cacheEnvId: string;
    searchTexts: string[];
    modelIds: string[];
  }): Promise<CachedUniqueValueSearchResult> {
    let { projectId, structId, cacheEnvId, searchTexts, modelIds } = item;

    let searchTermValues = searchTexts.map(searchText => {
      let escapedSearchText = searchText.replace(/[\\%_]/g, x => `\\${x}`);

      let searchPattern = `%${escapedSearchText.toLowerCase()}%`;

      return sql`(${searchText}, ${searchPattern})`;
    });

    let modelIdValues = modelIds.map(modelId => sql`(${modelId})`);

    let rawData: { rows: CachedUniqueValueSearchRow[] } =
      await this.db.drizzle.execute(sql`
WITH search_terms(search_text, search_pattern) AS (
  VALUES ${sql.join(searchTermValues, sql`, `)}
),
accessible_models(model_id) AS (
  VALUES ${sql.join(modelIdValues, sql`, `)}
),
matched_fields_base AS (
  SELECT
    search_terms.search_text,
    search_terms.search_pattern,
    cached_parts.connection_id,
    cached_parts.schema_name,
    cached_parts.table_name,
    cached_parts.column_name,
    max(cached_parts.count) AS max_count,
    array_agg(DISTINCT model_field_leafs.model_id ORDER BY model_field_leafs.model_id) AS model_ids
  FROM ${cachedPartsTable} AS cached_parts
  INNER JOIN ${cachedColumnsTable} AS cached_columns
    ON cached_columns.project_id = cached_parts.project_id
    AND cached_columns.connection_id = cached_parts.connection_id
    AND cached_columns.env_id = cached_parts.env_id
    AND cached_columns.schema_name = cached_parts.schema_name
    AND cached_columns.table_name = cached_parts.table_name
    AND cached_columns.column_name = cached_parts.column_name
  INNER JOIN ${modelFieldLeafsTable} AS model_field_leafs
    ON model_field_leafs.struct_id = ${structId}
    AND model_field_leafs.model_type = ${ModelTypeEnum.Malloy}
    AND model_field_leafs.field_result = ${FieldResultEnum.String}
    AND model_field_leafs.column_name IS NOT NULL
    AND lower(coalesce(model_field_leafs.connection_id, '')) = lower(coalesce(cached_parts.connection_id, ''))
    AND lower(coalesce(model_field_leafs.schema_name, '')) = lower(coalesce(cached_parts.schema_name, ''))
    AND lower(coalesce(model_field_leafs.table_name, '')) = lower(coalesce(cached_parts.table_name, ''))
    AND lower(coalesce(model_field_leafs.column_name, '')) = lower(coalesce(cached_parts.column_name, ''))
  INNER JOIN accessible_models
    ON accessible_models.model_id = model_field_leafs.model_id
  INNER JOIN search_terms
    ON lower(coalesce(cached_parts.column_value, '')) LIKE search_terms.search_pattern ESCAPE '\'
  WHERE cached_parts.project_id = ${projectId}
    AND cached_parts.env_id = ${cacheEnvId}
  GROUP BY
    search_terms.search_text,
    search_terms.search_pattern,
    cached_parts.connection_id,
    cached_parts.schema_name,
    cached_parts.table_name,
    cached_parts.column_name
),
matched_fields AS (
  SELECT
    *,
    row_number() OVER (
      PARTITION BY search_text
      ORDER BY max_count DESC
    ) AS field_rank
  FROM matched_fields_base
),
ranked_values AS (
  SELECT
    matched_fields.search_text AS "searchText",
    matched_fields.connection_id AS "connectionId",
    matched_fields.schema_name AS "schemaName",
    matched_fields.table_name AS "tableName",
    matched_fields.column_name AS "columnName",
    cached_parts.column_value AS "value",
    cached_parts.count AS "count",
    matched_fields.model_ids AS "modelIds",
    matched_fields.max_count,
    matched_fields.field_rank,
    row_number() OVER (
      PARTITION BY matched_fields.search_text, cached_parts.connection_id, cached_parts.schema_name, cached_parts.table_name, cached_parts.column_name
      ORDER BY cached_parts.count DESC
    ) AS value_rank
  FROM matched_fields
  INNER JOIN ${cachedPartsTable} AS cached_parts
    ON cached_parts.project_id = ${projectId}
    AND cached_parts.env_id = ${cacheEnvId}
    AND cached_parts.connection_id = matched_fields.connection_id
    AND cached_parts.schema_name = matched_fields.schema_name
    AND cached_parts.table_name = matched_fields.table_name
    AND cached_parts.column_name = matched_fields.column_name
  WHERE matched_fields.field_rank <= ${UNIQUE_VALUES_MATCH_FIELDS_LIMIT}
    AND lower(coalesce(cached_parts.column_value, '')) LIKE matched_fields.search_pattern ESCAPE '\'
)
SELECT
  "searchText",
  "connectionId",
  "schemaName",
  "tableName",
  "columnName",
  "value",
  "count",
  "modelIds"
FROM ranked_values
WHERE value_rank <= ${UNIQUE_VALUES_MATCH_VALUES_LIMIT}
ORDER BY "searchText", field_rank, value_rank;
`);

    let rows = rawData.rows || [];

    let result: CachedUniqueValueSearchResult = searchTexts.map(searchText => {
      let matchFields: CachedUniqueValueSearchMatch[] = [];

      return {
        searchText: searchText,
        matchFields: matchFields
      };
    });

    rows.forEach(row => {
      let resultItem = result.find(x => x.searchText === row.searchText);

      if (!resultItem) {
        return;
      }

      let matchField = resultItem.matchFields.find(
        x =>
          x.connectionId === row.connectionId &&
          x.schemaName === row.schemaName &&
          x.tableName === row.tableName &&
          x.columnName === row.columnName
      );

      if (!matchField) {
        matchField = {
          connectionId: row.connectionId,
          schemaName: row.schemaName,
          tableName: row.tableName,
          columnName: row.columnName,
          modelIds: row.modelIds ?? [],
          matchedValues: []
        };

        resultItem.matchFields.push(matchField);
      }

      matchField.matchedValues.push({
        value: row.value ?? '',
        count: row.count
      });
    });

    return result;
  }
}
