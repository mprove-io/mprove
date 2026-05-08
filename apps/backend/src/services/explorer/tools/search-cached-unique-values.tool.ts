import type {
  FieldDef as MalloyFieldDef,
  ModelDef as MalloyModelDef,
  SourceDef as MalloySourceDef
} from '@malloydata/malloy';
import { Inject, Injectable } from '@nestjs/common';
import { type Tool, tool } from 'ai';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { CachedColumnService } from '#backend/services/db/cached-column.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { TabService } from '#backend/services/tab.service';
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
};

interface CachedUniqueValueFieldModelIds {
  fieldKey: string;
  modelIds: string[];
}

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
    private modelsService: ModelsService,
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

    let fieldModelIds: CachedUniqueValueFieldModelIds[] = [];

    modelTabs
      .filter(model =>
        checkModelAccess({
          member: userMember,
          modelAccessRoles: model.accessRoles
        })
      )
      .map(model =>
        this.modelsService.tabToApi({
          model: model,
          hasAccess: true
        })
      )
      .filter(model => model.type === ModelTypeEnum.Malloy)
      .forEach(model => {
        let malloyModelDef: MalloyModelDef = model.malloyModelDef;

        Object.values(malloyModelDef?.contents ?? {})
          .map(sourceDef => ({ sourceDef: sourceDef }))
          .filter(
            (
              sourceDefItem
            ): sourceDefItem is { sourceDef: MalloySourceDef } => {
              return (
                'fields' in sourceDefItem.sourceDef &&
                'connection' in sourceDefItem.sourceDef
              );
            }
          )
          .forEach(sourceDefItem => {
            this.collectSourceDwhReferences({
              modelId: model.modelId,
              connectionId: model.connectionId,
              sourceDef: sourceDefItem.sourceDef,
              fieldModelIds: fieldModelIds
            });
          });
      });

    let cacheEnvId = await this.cachedColumnService.getCacheEnvId({
      projectId: projectId,
      envId: envId
    });

    return this.searchCachedUniqueValueFields({
      projectId: projectId,
      cacheEnvId: cacheEnvId,
      searchTexts: trimmedSearchTexts,
      fieldModelIds: fieldModelIds
    });
  }

  private collectSourceDwhReferences(item: {
    modelId: string;
    connectionId: string;
    sourceDef: MalloySourceDef | MalloyFieldDef;
    fieldModelIds: CachedUniqueValueFieldModelIds[];
  }) {
    let { modelId, connectionId, sourceDef, fieldModelIds } = item;
    let isTableSource = sourceDef.type === 'table';

    if (isTableSource) {
      let tablePath = 'tablePath' in sourceDef ? sourceDef.tablePath : '';

      let tablePathParts = tablePath
        .split('.')
        .map(part => part.trim().replace(/^['"`]+|['"`]+$/g, ''))
        .filter(part => part.length > 0);

      let schemaName =
        tablePathParts.length > 1 ? tablePathParts.at(-2) : undefined;

      let tableName = tablePathParts.at(-1);

      let fields: MalloyFieldDef[] =
        'fields' in sourceDef ? sourceDef.fields : [];

      let hasFields = Array.isArray(fields);

      if (hasFields) {
        fields.forEach(field => {
          let isStringField = field.type === 'string';

          if (isStringField === false) {
            return;
          }

          let columnName = this.getDwhColumnNameFromField({
            field: field
          });

          if (!columnName) {
            return;
          }

          let fieldKey = this.makeFieldKey({
            connectionId: connectionId,
            schemaName: schemaName,
            tableName: tableName,
            columnName: columnName
          });

          let fieldModelId = fieldModelIds.find(x => x.fieldKey === fieldKey);

          if (!fieldModelId) {
            fieldModelId = {
              fieldKey: fieldKey,
              modelIds: []
            };

            fieldModelIds.push(fieldModelId);
          }

          let hasModelId = fieldModelId.modelIds.includes(modelId);

          if (hasModelId === false) {
            fieldModelId.modelIds.push(modelId);
            fieldModelId.modelIds.sort();
          }
        });
      }
    }

    let fields: MalloyFieldDef[] =
      'fields' in sourceDef ? sourceDef.fields : [];

    let hasFields = Array.isArray(fields);

    if (hasFields === false) {
      return;
    }

    fields.forEach(field => {
      this.collectSourceDwhReferences({
        modelId: modelId,
        connectionId: connectionId,
        sourceDef: field,
        fieldModelIds: fieldModelIds
      });
    });
  }

  private getDwhColumnNameFromField(item: {
    field: MalloyFieldDef;
  }): string | undefined {
    let { field } = item;

    if (!('e' in field) || field.e === undefined) {
      return 'name' in field ? field.name : undefined;
    }

    if (field.e.node !== 'field') {
      return undefined;
    }

    let isSimpleFieldReference = field.e.path.length === 1;

    if (isSimpleFieldReference === false) {
      return undefined;
    }

    return field.e.path[0];
  }

  private async searchCachedUniqueValueFields(item: {
    projectId: string;
    cacheEnvId: string;
    searchTexts: string[];
    fieldModelIds: CachedUniqueValueFieldModelIds[];
  }): Promise<CachedUniqueValueSearchResult> {
    let { projectId, cacheEnvId, searchTexts, fieldModelIds } = item;

    let searchTermValues = searchTexts.map(searchText => {
      let escapedSearchText = searchText.replace(/[\\%_]/g, x => `\\${x}`);

      let searchPattern = `%${escapedSearchText.toLowerCase()}%`;

      return sql`(${searchText}, ${searchPattern})`;
    });

    let rawData: { rows: CachedUniqueValueSearchRow[] } =
      await this.db.drizzle.execute(sql`
WITH search_terms(search_text, search_pattern) AS (
  VALUES ${sql.join(searchTermValues, sql`, `)}
),
matched_fields_base AS (
  SELECT
    search_terms.search_text,
    search_terms.search_pattern,
    cached_parts.connection_id,
    cached_parts.schema_name,
    cached_parts.table_name,
    cached_parts.column_name,
    max(cached_parts.count) AS max_count
  FROM ${cachedPartsTable} AS cached_parts
  INNER JOIN ${cachedColumnsTable} AS cached_columns
    ON cached_columns.project_id = cached_parts.project_id
    AND cached_columns.connection_id = cached_parts.connection_id
    AND cached_columns.env_id = cached_parts.env_id
    AND cached_columns.schema_name = cached_parts.schema_name
    AND cached_columns.table_name = cached_parts.table_name
    AND cached_columns.column_name = cached_parts.column_name
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
  "count"
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
          modelIds:
            fieldModelIds.find(
              x =>
                x.fieldKey ===
                this.makeFieldKey({
                  connectionId: row.connectionId,
                  schemaName: row.schemaName,
                  tableName: row.tableName,
                  columnName: row.columnName
                })
            )?.modelIds ?? [],
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

  private makeFieldKey(item: {
    connectionId: string;
    schemaName: string | undefined;
    tableName: string | undefined;
    columnName: string;
  }): string {
    let { connectionId, schemaName, tableName, columnName } = item;

    return [connectionId, schemaName, tableName, columnName]
      .map(value =>
        (value ?? '')
          .trim()
          .replace(/^['"`]+|['"`]+$/g, '')
          .toLowerCase()
      )
      .join('.');
  }
}
