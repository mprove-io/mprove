import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { modelFieldLeafsTable } from '#backend/drizzle/postgres/schema/model-field-leafs';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import type { SearchFieldMatch } from './search-model-fields.types';

type SearchModelFieldLeafNameRow = {
  searchFieldName: string;
  modelId: string;
  fieldId: string;
  matchedOn: string[];
};

export const SEARCH_FIELD_NAMES_LIMIT = 10;
export const SEARCH_FIELD_NAME_MATCH_FIELDS_LIMIT = 50;

@Injectable()
export class SearchModelFieldLeafNamesService {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  async search(item: {
    structId: string;
    searchFieldNames: string[];
    modelIds: string[];
  }): Promise<SearchFieldMatch[]> {
    let { structId, searchFieldNames, modelIds } = item;

    if (searchFieldNames.length === 0 || modelIds.length === 0) {
      return [];
    }

    let searchTermValues = searchFieldNames.map(searchFieldName => {
      let escapedSearchFieldName = searchFieldName.replace(
        /[\\%_]/g,
        x => `\\${x}`
      );

      let searchPattern = `%${escapedSearchFieldName.toLowerCase()}%`;

      return sql`(${searchFieldName}, ${searchPattern})`;
    });

    let modelIdValues = modelIds.map(modelId => sql`(${modelId})`);

    let rawData: { rows: SearchModelFieldLeafNameRow[] } =
      await this.db.drizzle.execute(sql`
WITH search_terms(search_field_name, search_pattern) AS (
  VALUES ${sql.join(searchTermValues, sql`, `)}
),
accessible_models(model_id) AS (
  VALUES ${sql.join(modelIdValues, sql`, `)}
),
matched_fields AS (
  SELECT
    search_terms.search_field_name,
    model_field_leafs.model_id,
    model_field_leafs.field_id,
    array_remove(ARRAY[
      CASE WHEN lower(coalesce(model_field_leafs.field_name, '')) LIKE search_terms.search_pattern ESCAPE '\' THEN 'fieldName' END,
      CASE WHEN lower(coalesce(model_field_leafs.field_id, '')) LIKE search_terms.search_pattern ESCAPE '\' THEN 'fieldId' END,
      CASE WHEN lower(coalesce(model_field_leafs.malloy_field_name, '')) LIKE search_terms.search_pattern ESCAPE '\' THEN 'malloyFieldName' END,
      CASE WHEN lower(coalesce(model_field_leafs.sql_name, '')) LIKE search_terms.search_pattern ESCAPE '\' THEN 'sqlName' END,
      CASE WHEN lower(coalesce(model_field_leafs.label, '')) LIKE search_terms.search_pattern ESCAPE '\' THEN 'label' END,
      CASE WHEN lower(coalesce(model_field_leafs.description, '')) LIKE search_terms.search_pattern ESCAPE '\' THEN 'description' END
    ], NULL) AS matched_on
  FROM ${modelFieldLeafsTable} AS model_field_leafs
  INNER JOIN accessible_models
    ON accessible_models.model_id = model_field_leafs.model_id
  INNER JOIN search_terms
    ON lower(coalesce(model_field_leafs.field_name, '')) LIKE search_terms.search_pattern ESCAPE '\'
    OR lower(coalesce(model_field_leafs.field_id, '')) LIKE search_terms.search_pattern ESCAPE '\'
    OR lower(coalesce(model_field_leafs.malloy_field_name, '')) LIKE search_terms.search_pattern ESCAPE '\'
    OR lower(coalesce(model_field_leafs.sql_name, '')) LIKE search_terms.search_pattern ESCAPE '\'
    OR lower(coalesce(model_field_leafs.label, '')) LIKE search_terms.search_pattern ESCAPE '\'
    OR lower(coalesce(model_field_leafs.description, '')) LIKE search_terms.search_pattern ESCAPE '\'
  WHERE model_field_leafs.struct_id = ${structId}
    AND model_field_leafs.model_type = ${ModelTypeEnum.Malloy}
),
ranked_fields AS (
  SELECT
    *,
    row_number() OVER (
      PARTITION BY search_field_name
      ORDER BY model_id, field_id
    ) AS field_rank
  FROM matched_fields
)
SELECT
  search_field_name AS "searchFieldName",
  model_id AS "modelId",
  field_id AS "fieldId",
  matched_on AS "matchedOn"
FROM ranked_fields
WHERE field_rank <= ${SEARCH_FIELD_NAME_MATCH_FIELDS_LIMIT}
ORDER BY search_field_name, field_rank;
`);

    let rows = rawData.rows || [];

    return this.rowsToMatches({ rows: rows });
  }

  private rowsToMatches(item: {
    rows: SearchModelFieldLeafNameRow[];
  }): SearchFieldMatch[] {
    let { rows } = item;

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

      match.matchedByNames.push({
        searchFieldName: row.searchFieldName,
        matchedOn: row.matchedOn ?? []
      });
    });

    return matches;
  }
}
