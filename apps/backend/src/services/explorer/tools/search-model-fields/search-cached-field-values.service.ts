import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { modelFieldLeafsTable } from '#backend/drizzle/postgres/schema/model-field-leafs';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import type { SearchFieldMatch } from './search-model-fields.types';

type SearchCachedFieldValueRow = {
  searchFieldValue: string;
  modelId: string;
  fieldId: string;
  value: string | null;
  count: number;
};

export const SEARCH_FIELD_VALUES_LIMIT = 10;
export const SEARCH_FIELD_VALUE_MATCH_FIELDS_LIMIT = 30;
export const SEARCH_FIELD_VALUE_MATCH_VALUES_LIMIT = 20;

@Injectable()
export class SearchCachedFieldValuesService {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  async search(item: {
    projectId: string;
    structId: string;
    cacheEnvId: string;
    searchFieldValues: string[];
    modelIds: string[];
  }): Promise<SearchFieldMatch[]> {
    let { projectId, structId, cacheEnvId, searchFieldValues, modelIds } = item;

    // console.log('SearchCachedFieldValuesService item:');
    // console.log(item);

    if (searchFieldValues.length === 0 || modelIds.length === 0) {
      return [];
    }

    let searchTermValues = searchFieldValues.map(searchFieldValue => {
      let escapedSearchFieldValue = searchFieldValue.replace(
        /[\\%_]/g,
        x => `\\${x}`
      );

      let searchPattern = `%${escapedSearchFieldValue.toLowerCase()}%`;

      return sql`(${searchFieldValue}, ${searchPattern})`;
    });

    let modelIdValues = modelIds.map(modelId => sql`(${modelId})`);

    let rawData: { rows: SearchCachedFieldValueRow[] } =
      await this.db.drizzle.execute(sql`
WITH search_terms(search_field_value, search_pattern) AS (
  VALUES ${sql.join(searchTermValues, sql`, `)}
),
accessible_models(model_id) AS (
  VALUES ${sql.join(modelIdValues, sql`, `)}
),
matched_fields_base AS (
  SELECT
    search_terms.search_field_value,
    search_terms.search_pattern,
    model_field_leafs.model_id,
    model_field_leafs.field_id,
    cached_parts.connection_id,
    cached_parts.schema_name_lc,
    cached_parts.table_name_lc,
    cached_parts.column_name_lc,
    max(cached_parts.count) AS max_count
  FROM ${cachedPartsTable} AS cached_parts
  INNER JOIN ${cachedColumnsTable} AS cached_columns
    ON cached_columns.project_id = cached_parts.project_id
    AND cached_columns.connection_id = cached_parts.connection_id
    AND cached_columns.env_id = cached_parts.env_id
    AND cached_columns.schema_name_lc = cached_parts.schema_name_lc
    AND cached_columns.table_name_lc = cached_parts.table_name_lc
    AND cached_columns.column_name_lc = cached_parts.column_name_lc
  INNER JOIN ${modelFieldLeafsTable} AS model_field_leafs
    ON model_field_leafs.struct_id = ${structId}
    AND model_field_leafs.model_type = ${ModelTypeEnum.Malloy}
    AND model_field_leafs.field_result = ${FieldResultEnum.String}
    AND model_field_leafs.column_name_lc IS NOT NULL
    AND model_field_leafs.connection_id = cached_parts.connection_id
    AND model_field_leafs.schema_name_lc = cached_parts.schema_name_lc
    AND model_field_leafs.table_name_lc = cached_parts.table_name_lc
    AND model_field_leafs.column_name_lc = cached_parts.column_name_lc
  INNER JOIN accessible_models
    ON accessible_models.model_id = model_field_leafs.model_id
  INNER JOIN search_terms
    ON cached_parts.column_value_lc LIKE search_terms.search_pattern ESCAPE '\'
  WHERE cached_parts.project_id = ${projectId}
    AND cached_parts.env_id = ${cacheEnvId}
  GROUP BY
    search_terms.search_field_value,
    search_terms.search_pattern,
    model_field_leafs.model_id,
    model_field_leafs.field_id,
    cached_parts.connection_id,
    cached_parts.schema_name_lc,
    cached_parts.table_name_lc,
    cached_parts.column_name_lc
),
matched_fields AS (
  SELECT
    *,
    row_number() OVER (
      PARTITION BY search_field_value
      ORDER BY max_count DESC
    ) AS field_rank
  FROM matched_fields_base
),
ranked_values AS (
  SELECT
    matched_fields.search_field_value AS "searchFieldValue",
    matched_fields.model_id AS "modelId",
    matched_fields.field_id AS "fieldId",
    cached_parts.column_value AS "value",
    cached_parts.count AS "count",
    matched_fields.max_count,
    matched_fields.field_rank,
    row_number() OVER (
      PARTITION BY matched_fields.search_field_value, matched_fields.model_id, matched_fields.field_id
      ORDER BY cached_parts.count DESC
    ) AS value_rank
  FROM matched_fields
  INNER JOIN ${cachedPartsTable} AS cached_parts
    ON cached_parts.project_id = ${projectId}
    AND cached_parts.env_id = ${cacheEnvId}
    AND cached_parts.connection_id = matched_fields.connection_id
    AND cached_parts.schema_name_lc = matched_fields.schema_name_lc
    AND cached_parts.table_name_lc = matched_fields.table_name_lc
    AND cached_parts.column_name_lc = matched_fields.column_name_lc
  WHERE matched_fields.field_rank <= ${SEARCH_FIELD_VALUE_MATCH_FIELDS_LIMIT}
    AND cached_parts.column_value_lc LIKE matched_fields.search_pattern ESCAPE '\'
)
SELECT
  "searchFieldValue",
  "modelId",
  "fieldId",
  "value",
  "count"
FROM ranked_values
WHERE value_rank <= ${SEARCH_FIELD_VALUE_MATCH_VALUES_LIMIT}
ORDER BY "searchFieldValue", field_rank, value_rank;
`);

    let rows = rawData.rows || [];

    let matches: SearchFieldMatch[] = [];

    rows.forEach(row => {
      let match = matches.find(
        x => x.modelId === row.modelId && x.fieldId === row.fieldId
      );

      if (!match) {
        match = {
          modelId: row.modelId,
          fieldId: row.fieldId,
          matchedByValues: [],
          matchedByNames: []
        };

        matches.push(match);
      }

      let matchedByValue = match.matchedByValues.find(
        x => x.searchFieldValue === row.searchFieldValue
      );

      if (!matchedByValue) {
        matchedByValue = {
          searchFieldValue: row.searchFieldValue,
          matchedValues: []
        };

        match.matchedByValues.push(matchedByValue);
      }

      matchedByValue.matchedValues.push({
        value: row.value ?? '',
        count: row.count
      });
    });

    // console.log('SearchCachedFieldValuesService matches:');
    // console.log(matches);

    return matches;
  }
}
