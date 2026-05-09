import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { GetConnectionSchemasService } from '#backend/controllers/connections/get-connection-schemas/get-connection-schemas.service';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ModelFieldLeafEnt } from '#backend/drizzle/postgres/schema/model-field-leafs';
import { modelFieldLeafsTable } from '#backend/drizzle/postgres/schema/model-field-leafs';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import type { CombinedSchemaItem } from '#common/zod/backend/connection-schemas/combined-schema';
import type { SearchFieldMatch } from './search-model-fields.types';

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

  async search(item: {
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

    // console.log('SearchDwhSchemaFieldNamesService item:');
    // console.log(item);

    if (searchFieldNames.length === 0 || modelIds.length === 0) {
      return [];
    }

    let schemaResult =
      await this.getConnectionSchemasService.getConnectionSchemas({
        userId: userId,
        projectId: projectId,
        envId: envId,
        repoId: repoId,
        branchId: branchId,
        isRefreshExistingCache: false
      });

    let dwhMatches = this.findDwhMatches({
      combinedSchemaItems: schemaResult.combinedSchemaItems,
      searchFieldNames: searchFieldNames
    });

    if (dwhMatches.length === 0) {
      return [];
    }

    let leafs = await this.db.drizzle.query.modelFieldLeafsTable.findMany({
      where: and(
        eq(modelFieldLeafsTable.structId, structId),
        eq(modelFieldLeafsTable.modelType, ModelTypeEnum.Malloy),
        inArray(modelFieldLeafsTable.modelId, modelIds)
      )
    });

    return this.mapDwhMatchesToLeafs({
      dwhMatches: dwhMatches,
      leafs: leafs
    });
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
    leafs: ModelFieldLeafEnt[];
  }): SearchFieldMatch[] {
    let { dwhMatches, leafs } = item;

    let matches: SearchFieldMatch[] = [];

    dwhMatches.forEach(dwhMatch => {
      let matchingLeafs = leafs.filter(leaf => {
        let isConnectionMatch =
          (leaf.connectionId ?? '').toLowerCase() ===
          dwhMatch.connectionId.toLowerCase();

        let isSchemaMatch =
          (leaf.schemaName ?? '').toLowerCase() ===
          dwhMatch.schemaName.toLowerCase();

        let isTableMatch =
          (leaf.tableName ?? '').toLowerCase() ===
          dwhMatch.tableName.toLowerCase();

        let isColumnMatch =
          (leaf.columnName ?? '').toLowerCase() ===
          dwhMatch.columnName.toLowerCase();

        return (
          isConnectionMatch && isSchemaMatch && isTableMatch && isColumnMatch
        );
      });

      matchingLeafs.forEach(leaf => {
        let match = matches.find(
          x => x.modelId === leaf.modelId && x.fieldId === leaf.fieldId
        );

        if (!match) {
          match = {
            modelId: leaf.modelId,
            fieldId: leaf.fieldId,
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
