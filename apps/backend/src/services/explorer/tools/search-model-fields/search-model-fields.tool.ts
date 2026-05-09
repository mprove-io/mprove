import { Inject, Injectable } from '@nestjs/common';
import { type Tool, tool } from 'ai';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { BridgesService } from '#backend/services/db/bridges.service';
import { CachedColumnService } from '#backend/services/db/cached-column.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import {
  SEARCH_FIELD_VALUE_MATCH_FIELDS_LIMIT,
  SEARCH_FIELD_VALUE_MATCH_VALUES_LIMIT,
  SEARCH_FIELD_VALUES_LIMIT,
  SearchCachedFieldValuesService
} from './search-cached-field-values.service';
import { SearchDwhSchemaFieldNamesService } from './search-dwh-schema-field-names.service';
import {
  SEARCH_FIELD_NAME_MATCH_FIELDS_LIMIT,
  SEARCH_FIELD_NAMES_LIMIT,
  SearchModelFieldLeafNamesService
} from './search-model-field-leaf-names.service';
import type {
  SearchFieldMatch,
  SearchModelFieldsToolResult
} from './search-model-fields.types';

export const SEARCH_MODEL_FIELDS_INPUT_LIMIT = 10;

@Injectable()
export class SearchModelFieldsToolService {
  constructor(
    private cachedColumnService: CachedColumnService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private tabService: TabService,
    private searchCachedFieldValuesService: SearchCachedFieldValuesService,
    private searchModelFieldLeafNamesService: SearchModelFieldLeafNamesService,
    private searchDwhSchemaFieldNamesService: SearchDwhSchemaFieldNamesService,
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
      description: `Search fields by cached field values and by field names. Use searchFieldValues for literal values from the user's question. Use searchFieldNames for ambiguous field labels, names, or descriptions. The tool returns fields grouped by modelId and fieldId. Value search returns up to ${SEARCH_FIELD_VALUE_MATCH_VALUES_LIMIT} values per matched field and up to ${SEARCH_FIELD_VALUE_MATCH_FIELDS_LIMIT} matched fields per search value. Name search returns up to ${SEARCH_FIELD_NAME_MATCH_FIELDS_LIMIT} matched fields per search name.`,
      inputSchema: z
        .object({
          searchFieldValues: z
            .array(z.string())
            .max(SEARCH_FIELD_VALUES_LIMIT)
            .nullish()
            .describe(
              `Zero to ${SEARCH_FIELD_VALUES_LIMIT} literal field values to search for in cached unique values.`
            ),
          searchFieldNames: z
            .array(z.string())
            .max(SEARCH_FIELD_NAMES_LIMIT)
            .nullish()
            .describe(
              `Zero to ${SEARCH_FIELD_NAMES_LIMIT} field names, labels, or descriptions to search for.`
            )
        })
        .refine(
          input => {
            let searchFieldValues = input.searchFieldValues ?? [];

            let searchFieldNames = input.searchFieldNames ?? [];

            let hasSearchFieldValue = searchFieldValues.some(
              searchFieldValue => searchFieldValue.trim().length > 0
            );

            let hasSearchFieldName = searchFieldNames.some(
              searchFieldName => searchFieldName.trim().length > 0
            );

            return hasSearchFieldValue || hasSearchFieldName;
          },
          {
            message:
              'Provide at least one non-empty searchFieldValues or searchFieldNames item.'
          }
        ),
      execute: async input => {
        let result = await this.searchFields({
          user: user,
          projectId: projectId,
          repoId: repoId,
          branchId: branchId,
          envId: envId,
          searchFieldValues: input.searchFieldValues ?? [],
          searchFieldNames: input.searchFieldNames ?? []
        });

        return result;
      }
    });
  }

  private async searchFields(item: {
    user: UserTab;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    searchFieldValues: string[];
    searchFieldNames: string[];
  }): Promise<SearchModelFieldsToolResult> {
    let {
      user,
      projectId,
      repoId,
      branchId,
      envId,
      searchFieldValues,
      searchFieldNames
    } = item;

    let trimmedSearchFieldValues = searchFieldValues
      .map(searchFieldValue => searchFieldValue.trim())
      .filter(searchFieldValue => searchFieldValue.length > 0);

    let trimmedSearchFieldNames = searchFieldNames
      .map(searchFieldName => searchFieldName.trim())
      .filter(searchFieldName => searchFieldName.length > 0);

    await this.projectsService.getProjectCheckExists({ projectId: projectId });

    let userMember = await this.membersService.getMemberCheckExists({
      memberId: user.userId,
      projectId: projectId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId,
      envId: envId
    });

    let modelTabs = await this.db.drizzle.query.modelsTable
      .findMany({
        where: eq(modelsTable.structId, bridge.structId)
      })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let accessibleMalloyModelTabs = modelTabs
      .filter(model =>
        checkModelAccess({
          member: userMember,
          modelAccessRoles: model.accessRoles
        })
      )
      .filter(model => model.type === ModelTypeEnum.Malloy);

    let modelIds = accessibleMalloyModelTabs.map(model => model.modelId);

    let cacheEnvId = await this.cachedColumnService.getCacheEnvId({
      projectId: projectId,
      envId: envId
    });

    let valueMatchesPromise =
      trimmedSearchFieldValues.length > 0
        ? this.searchCachedFieldValuesService.search({
            projectId: projectId,
            structId: bridge.structId,
            cacheEnvId: cacheEnvId,
            searchFieldValues: trimmedSearchFieldValues,
            modelIds: modelIds
          })
        : Promise.resolve([]);

    let leafNameMatchesPromise =
      trimmedSearchFieldNames.length > 0
        ? this.searchModelFieldLeafNamesService.search({
            structId: bridge.structId,
            searchFieldNames: trimmedSearchFieldNames,
            modelIds: modelIds
          })
        : Promise.resolve([]);

    let dwhNameMatchesPromise =
      trimmedSearchFieldNames.length > 0
        ? this.searchDwhSchemaFieldNamesService.search({
            userId: user.userId,
            projectId: projectId,
            repoId: repoId,
            branchId: branchId,
            envId: envId,
            structId: bridge.structId,
            searchFieldNames: trimmedSearchFieldNames,
            modelIds: modelIds
          })
        : Promise.resolve([]);

    let [valueMatches, leafNameMatches, dwhNameMatches] = await Promise.all([
      valueMatchesPromise,
      leafNameMatchesPromise,
      dwhNameMatchesPromise
    ]);

    return this.mergeMatches({
      matches: valueMatches.concat(leafNameMatches).concat(dwhNameMatches)
    });
  }

  private mergeMatches(item: {
    matches: SearchFieldMatch[];
  }): SearchModelFieldsToolResult {
    let { matches } = item;

    let result: SearchModelFieldsToolResult = [];

    matches.forEach(match => {
      let modelResult = result.find(x => x.modelId === match.modelId);

      if (!modelResult) {
        modelResult = {
          modelId: match.modelId,
          matchedFields: []
        };

        result.push(modelResult);
      }

      let fieldResult = modelResult.matchedFields.find(
        x => x.fieldId === match.fieldId
      );

      if (!fieldResult) {
        fieldResult = {
          fieldId: match.fieldId,
          matchedByValues: [],
          matchedByNames: []
        };

        modelResult.matchedFields.push(fieldResult);
      }

      match.matchedByValues.forEach(matchedByValue => {
        let existing = fieldResult.matchedByValues.find(
          x => x.searchFieldValue === matchedByValue.searchFieldValue
        );

        if (!existing) {
          fieldResult.matchedByValues.push(matchedByValue);
          return;
        }

        matchedByValue.matchedValues.forEach(matchedValue => {
          let isAlreadyAdded = existing.matchedValues.some(
            x =>
              x.value === matchedValue.value && x.count === matchedValue.count
          );

          if (isAlreadyAdded === false) {
            existing.matchedValues.push(matchedValue);
          }
        });
      });

      match.matchedByNames.forEach(matchedByName => {
        let existing = fieldResult.matchedByNames.find(
          x => x.searchFieldName === matchedByName.searchFieldName
        );

        if (!existing) {
          fieldResult.matchedByNames.push(matchedByName);
          return;
        }

        matchedByName.matchedOn.forEach(matchedOn => {
          let isAlreadyAdded = existing.matchedOn.includes(matchedOn);

          if (isAlreadyAdded === false) {
            existing.matchedOn.push(matchedOn);
          }
        });
      });
    });

    // console.log('mergeMatches')
    // console.log(result)

    return result;
  }
}
