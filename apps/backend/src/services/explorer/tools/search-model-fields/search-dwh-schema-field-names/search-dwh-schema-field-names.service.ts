import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import { GetConnectionSchemasService } from '#backend/controllers/connections/get-connection-schemas/get-connection-schemas.service';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import {
  type ModelFieldLeafEnt,
  modelFieldLeafsTable
} from '#backend/drizzle/postgres/schema/model-field-leafs';
import { makeExplorerToolError } from '#backend/functions/make-explorer-tool-error/make-explorer-tool-error';
import type { SearchFieldMatch } from '#backend/services/explorer/tools/search-model-fields/search-model-fields.types';
import type { GetConnectionSchemasError } from '#common/types/backend/function-errors/get-connection-schemas-error';
import type { SearchDwhSchemaFieldNamesError } from '#common/types/backend/function-errors/search-dwh-schema-field-names-error';
import type { CombinedSchemaItem } from '#common/types/backend/parts/connection-schemas/combined-schemas/combined-schema-item';
import type { ToBackendGetConnectionSchemasOutput } from '#common/types/backend/routes/connections/get-connection-schemas/get-connection-schemas-output';

type DwhFieldNameMatch = {
  searchFieldName: string;
  connectionId: string;
  schemaName: string;
  tableName: string;
  columnName: string;
  matchedOn: string[];
};

@Injectable()
export class SearchDwhSchemaFieldNamesService {
  constructor(
    private getConnectionSchemasService: GetConnectionSchemasService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async searchUnwrap(item: {
    userId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    structId: string;
    searchFieldNames: string[];
    modelIds: string[];
  }): Promise<SearchFieldMatch[]> {
    let {
      userId,
      projectId,
      repoId,
      branchId,
      envId,
      structId,
      searchFieldNames,
      modelIds
    } = item;

    let result: Result.Result<
      SearchFieldMatch[],
      SearchDwhSchemaFieldNamesError
    > = await this.search({
      userId: userId,
      projectId: projectId,
      repoId: repoId,
      branchId: branchId,
      envId: envId,
      structId: structId,
      searchFieldNames: searchFieldNames,
      modelIds: modelIds
    });

    if (Result.isFailure(result)) {
      throw makeExplorerToolError({ error: result.error });
    }

    let matches: SearchFieldMatch[] = result.value;

    return matches;
  }

  async search(item: {
    userId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    structId: string;
    searchFieldNames: string[];
    modelIds: string[];
  }): Result.ResultAsync<SearchFieldMatch[], SearchDwhSchemaFieldNamesError> {
    let { searchFieldNames, modelIds } = item;

    if (searchFieldNames.length === 0 || modelIds.length === 0) {
      return Result.succeed([]);
    }

    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'schemaOutput',
        (
          v
        ): Result.ResultAsync<
          ToBackendGetConnectionSchemasOutput,
          GetConnectionSchemasError
        > =>
          this.getConnectionSchemasService.getConnectionSchemas({
            userId: v.userId,
            projectId: v.projectId,
            envId: v.envId,
            repoId: v.repoId,
            branchId: v.branchId,
            isRefreshExistingCache: false
          })
      ),
      Result.bind(
        'dwhMatches',
        (v): Result.Result<DwhFieldNameMatch[], never> =>
          Result.succeed(
            this.findDwhMatches({
              combinedSchemaItems: v.schemaOutput.combinedSchemaItems,
              searchFieldNames: v.searchFieldNames
            })
          )
      ),
      Result.bind(
        'leafEnts',
        async (v): Result.ResultAsync<ModelFieldLeafEnt[], never> =>
          v.dwhMatches.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.modelFieldLeafsTable
                .findMany({
                  where: and(
                    eq(modelFieldLeafsTable.structId, v.structId),
                    eq(modelFieldLeafsTable.modelType, 'Malloy'),
                    inArray(modelFieldLeafsTable.modelId, v.modelIds)
                  )
                })
                .then(xs => Result.succeed(xs))
      ),
      Result.map((v): SearchFieldMatch[] =>
        this.mapDwhMatchesToLeafs({
          dwhMatches: v.dwhMatches,
          leafEnts: v.leafEnts
        })
      )
    );
  }

  private findDwhMatches(item: {
    combinedSchemaItems: CombinedSchemaItem[];
    searchFieldNames: string[];
  }): DwhFieldNameMatch[] {
    let { combinedSchemaItems, searchFieldNames } = item;

    let matches: DwhFieldNameMatch[] = [];

    let normalizedSearches = searchFieldNames.map(searchFieldName => ({
      searchFieldName: searchFieldName,
      normalized: searchFieldName.toLowerCase()
    }));

    combinedSchemaItems.forEach(schemaItem => {
      schemaItem.schemas.forEach(schema => {
        schema.tables.forEach(table => {
          table.columns.forEach(column => {
            let normalizedColumnName = column.columnName.toLowerCase();

            let normalizedDescription = (
              column.description ?? ''
            ).toLowerCase();

            normalizedSearches.forEach(search => {
              let matchedOn: string[] = [];

              if (normalizedColumnName.includes(search.normalized)) {
                matchedOn.push('dwhColumnName');
              }

              if (normalizedDescription.includes(search.normalized)) {
                matchedOn.push('dwhColumnDescription');
              }

              if (matchedOn.length === 0) {
                return;
              }

              matches.push({
                searchFieldName: search.searchFieldName,
                connectionId: schemaItem.connectionId,
                schemaName: schema.schemaName,
                tableName: table.tableName,
                columnName: column.columnName,
                matchedOn: matchedOn
              });
            });
          });
        });
      });
    });

    return matches;
  }

  private mapDwhMatchesToLeafs(item: {
    dwhMatches: DwhFieldNameMatch[];
    leafEnts: ModelFieldLeafEnt[];
  }): SearchFieldMatch[] {
    let { dwhMatches, leafEnts } = item;

    let matches: SearchFieldMatch[] = [];

    dwhMatches.forEach(dwhMatch => {
      let matchingLeafEnts: ModelFieldLeafEnt[] = leafEnts.filter(leafEnt => {
        let isConnectionMatch =
          (leafEnt.connectionId ?? '') === dwhMatch.connectionId;

        let isSchemaMatch =
          (leafEnt.schemaNameLc ?? '') === dwhMatch.schemaName.toLowerCase();

        let isTableMatch =
          (leafEnt.tableNameLc ?? '') === dwhMatch.tableName.toLowerCase();

        let isColumnMatch =
          (leafEnt.columnNameLc ?? '') === dwhMatch.columnName.toLowerCase();

        return (
          isConnectionMatch && isSchemaMatch && isTableMatch && isColumnMatch
        );
      });

      matchingLeafEnts.forEach(leafEnt => {
        let match = matches.find(
          x => x.modelId === leafEnt.modelId && x.fieldId === leafEnt.fieldId
        );

        if (!match) {
          match = {
            modelId: leafEnt.modelId,
            fieldId: leafEnt.fieldId,
            matchedByValues: [],
            matchedByNames: []
          };

          matches.push(match);
        }

        let matchedByName = match.matchedByNames.find(
          x => x.searchFieldName === dwhMatch.searchFieldName
        );

        if (!matchedByName) {
          matchedByName = {
            searchFieldName: dwhMatch.searchFieldName,
            matchedOn: []
          };

          match.matchedByNames.push(matchedByName);
        }

        dwhMatch.matchedOn.forEach(matchedOn => {
          let isAlreadyAdded = matchedByName.matchedOn.includes(matchedOn);

          if (isAlreadyAdded === false) {
            matchedByName.matchedOn.push(matchedOn);
          }
        });
      });
    });

    // console.log('SearchDwhSchemaFieldNamesService matches:');
    // console.log(matches);

    return matches;
  }
}
