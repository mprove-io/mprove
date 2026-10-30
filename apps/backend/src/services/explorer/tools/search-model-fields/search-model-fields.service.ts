import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { getCacheEnvId } from '#backend/functions/db/envs/get-cache-env-id/get-cache-env-id';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { checkModelAccess } from '#backend/functions/db/models/check-model-access/check-model-access';
import { DbService } from '#backend/services/db/db.service';
import { SearchCachedFieldValuesService } from '#backend/services/explorer/tools/search-model-fields/search-cached-field-values/search-cached-field-values.service';
import { SearchDwhSchemaFieldNamesService } from '#backend/services/explorer/tools/search-model-fields/search-dwh-schema-field-names/search-dwh-schema-field-names.service';
import { SearchModelFieldLeafNamesService } from '#backend/services/explorer/tools/search-model-fields/search-model-field-leaf-names/search-model-field-leaf-names.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { SearchDwhSchemaFieldNamesError } from '#common/types/backend/function-errors/search-dwh-schema-field-names-error';
import type { SearchModelFieldsError } from '#common/types/backend/function-errors/search-model-fields-error';
import type {
  SearchFieldMatch,
  SearchFieldMatchedByName,
  SearchFieldMatchedByValue,
  SearchModelFieldsToolResult
} from './search-model-fields.types';

@Injectable()
export class SearchModelFieldsService {
  constructor(
    private searchCachedFieldValuesService: SearchCachedFieldValuesService,
    private searchModelFieldLeafNamesService: SearchModelFieldLeafNamesService,
    private searchDwhSchemaFieldNamesService: SearchDwhSchemaFieldNamesService,
    private db: DbService
  ) {}

  async searchModelFields(item: {
    userId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    searchFieldValues: string[];
    searchFieldNames: string[];
  }): Result.ResultAsync<SearchModelFieldsToolResult, SearchModelFieldsError> {
    return Result.pipe(
      Result.succeed({
        ...item,
        searchFieldValues: item.searchFieldValues
          .map(searchFieldValue => searchFieldValue.trim())
          .filter(searchFieldValue => searchFieldValue.length > 0),
        searchFieldNames: item.searchFieldNames
          .map(searchFieldName => searchFieldName.trim())
          .filter(searchFieldName => searchFieldName.length > 0)
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.userId),
            eq(membersTable.projectId, v.projectId)
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
            eq(bridgesTable.projectId, v.projectId),
            eq(bridgesTable.repoId, v.repoId),
            eq(bridgesTable.branchId, v.branchId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.bind('models', v =>
        this.db.models.findMany({
          where: eq(modelsTable.structId, v.bridge.structId)
        })
      ),
      Result.bind('accessibleMalloyModels', v =>
        Result.succeed(
          v.models
            .filter(model =>
              checkModelAccess({
                member: v.userMember,
                modelAccessRoles: model.accessRolesCombined
              })
            )
            .filter(model => model.type === 'Malloy')
        )
      ),
      Result.bind('modelIds', v =>
        Result.succeed(v.accessibleMalloyModels.map(model => model.modelId))
      ),
      Result.bind('cacheEnvId', v =>
        getCacheEnvId({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId
        })
      ),
      Result.bind('matches', async v => {
        // Launch all three searches in their original order. Promise.all must
        // still stop on the first rejection without waiting for other work.
        let valueMatchesPromise: Promise<SearchFieldMatch[]> =
          v.searchFieldValues.length > 0
            ? this.searchCachedFieldValuesService.search({
                projectId: v.projectId,
                structId: v.bridge.structId,
                cacheEnvId: v.cacheEnvId,
                searchFieldValues: v.searchFieldValues,
                modelIds: v.modelIds
              })
            : Promise.resolve([]);

        let leafNameMatchesPromise: Promise<SearchFieldMatch[]> =
          v.searchFieldNames.length > 0
            ? this.searchModelFieldLeafNamesService.search({
                structId: v.bridge.structId,
                searchFieldNames: v.searchFieldNames,
                modelIds: v.modelIds
              })
            : Promise.resolve([]);

        let dwhNameMatchesResult: Result.ResultAsync<
          SearchFieldMatch[],
          SearchDwhSchemaFieldNamesError
        > =
          v.searchFieldNames.length > 0
            ? this.searchDwhSchemaFieldNamesService.searchDwhSchemaFieldNames({
                userId: v.userId,
                projectId: v.projectId,
                repoId: v.repoId,
                branchId: v.branchId,
                envId: v.envId,
                structId: v.bridge.structId,
                searchFieldNames: v.searchFieldNames,
                modelIds: v.modelIds
              })
            : Promise.resolve(Result.succeed([]));

        let failure: Result.Failure<SearchDwhSchemaFieldNamesError>;

        let dwhNameMatchesPromise: Promise<SearchFieldMatch[]> =
          dwhNameMatchesResult.then(result => {
            if (Result.isFailure(result)) {
              failure = result;

              // The exact failure is recovered below, never by message/code.
              throw result;
            }

            return result.value;
          });

        try {
          let [
            valueMatches,
            leafNameMatches,
            dwhNameMatches
          ]: SearchFieldMatch[][] = await Promise.all([
            valueMatchesPromise,
            leafNameMatchesPromise,
            dwhNameMatchesPromise
          ]);

          return Result.succeed(
            valueMatches.concat(leafNameMatches).concat(dwhNameMatches)
          );
        } catch (error) {
          if (isDefined(failure) && error === failure) {
            return failure;
          }

          throw error;
        }
      }),
      Result.map(
        (v): SearchModelFieldsToolResult =>
          this.mergeMatches({ matches: v.matches })
      )
    );
  }

  private mergeMatches(item: {
    matches: SearchFieldMatch[];
  }): SearchModelFieldsToolResult {
    let { matches } = item;

    let result: SearchModelFieldsToolResult = [];

    matches.forEach(match => {
      let modelResult: SearchModelFieldsToolResult[number] = result.find(
        x => x.modelId === match.modelId
      );

      if (!modelResult) {
        modelResult = {
          modelId: match.modelId,
          matchedFields: []
        };

        result.push(modelResult);
      }

      let fieldResult: SearchModelFieldsToolResult[number]['matchedFields'][number] =
        modelResult.matchedFields.find(x => x.fieldId === match.fieldId);

      if (!fieldResult) {
        fieldResult = {
          fieldId: match.fieldId,
          matchedByValues: [],
          matchedByNames: []
        };

        modelResult.matchedFields.push(fieldResult);
      }

      match.matchedByValues.forEach(matchedByValue => {
        let existing: SearchFieldMatchedByValue =
          fieldResult.matchedByValues.find(
            x => x.searchFieldValue === matchedByValue.searchFieldValue
          );

        if (!existing) {
          fieldResult.matchedByValues.push(matchedByValue);

          return;
        }

        matchedByValue.matchedValues.forEach(matchedValue => {
          let isAlreadyAdded: boolean = existing.matchedValues.some(
            x =>
              x.value === matchedValue.value && x.count === matchedValue.count
          );

          if (isAlreadyAdded === false) {
            existing.matchedValues.push(matchedValue);
          }
        });
      });

      match.matchedByNames.forEach(matchedByName => {
        let existing: SearchFieldMatchedByName =
          fieldResult.matchedByNames.find(
            x => x.searchFieldName === matchedByName.searchFieldName
          );

        if (!existing) {
          fieldResult.matchedByNames.push(matchedByName);

          return;
        }

        matchedByName.matchedOn.forEach(matchedOn => {
          let isAlreadyAdded: boolean = existing.matchedOn.includes(matchedOn);

          if (isAlreadyAdded === false) {
            existing.matchedOn.push(matchedOn);
          }
        });
      });
    });

    return result;
  }
}
