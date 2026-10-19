import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { type Tool, tool } from 'ai';
import { z } from 'zod';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { makeExplorerToolError } from '#backend/functions/make-explorer-tool-error/make-explorer-tool-error';
import {
  SEARCH_FIELD_VALUE_MATCH_FIELDS_LIMIT,
  SEARCH_FIELD_VALUE_MATCH_VALUES_LIMIT,
  SEARCH_FIELD_VALUES_LIMIT
} from '#backend/services/explorer/tools/search-model-fields/search-cached-field-values/search-cached-field-values.service';
import {
  SEARCH_FIELD_NAME_MATCH_FIELDS_LIMIT,
  SEARCH_FIELD_NAMES_LIMIT
} from '#backend/services/explorer/tools/search-model-fields/search-model-field-leaf-names/search-model-field-leaf-names.service';
import { SearchModelFieldsService } from '#backend/services/explorer/tools/search-model-fields/search-model-fields.service';
import type { SearchModelFieldsToolResult } from '#backend/services/explorer/tools/search-model-fields/search-model-fields.types';
import type { SearchModelFieldsError } from '#common/types/backend/function-errors/search-model-fields-error';

export const SEARCH_MODEL_FIELDS_INPUT_LIMIT = 10;

@Injectable()
export class SearchModelFieldsToolService {
  constructor(private searchModelFieldsService: SearchModelFieldsService) {}

  makeTool(item: {
    user: UserTab;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }): Tool {
    let { user, projectId, repoId, branchId, envId } = item;

    let searchTool: Tool = tool({
      description: `Search fields by cached field values and by field names. Use searchFieldValues for literal values from the user's question. Use searchFieldNames for ambiguous field labels, names, or descriptions. The tool returns fields grouped by modelId and fieldId. Value search returns up to ${SEARCH_FIELD_VALUE_MATCH_VALUES_LIMIT} values per matched field and up to ${SEARCH_FIELD_VALUE_MATCH_FIELDS_LIMIT} matched fields per search value. Name search returns up to ${SEARCH_FIELD_NAME_MATCH_FIELDS_LIMIT} matched fields per search name.`,
      inputSchema: z
        .object({
          searchFieldValues: z
            .array(z.string())
            .max(SEARCH_FIELD_VALUES_LIMIT)
            .nullish()
            .describe(
              `Zero to ${SEARCH_FIELD_VALUES_LIMIT} literal field values to search for in cached unique values. 
In most cases, each searchFieldValue should be an individual word. 
So searchFieldValues will be a list of individual words.`
            ),
          searchFieldNames: z
            .array(z.string())
            .max(SEARCH_FIELD_NAMES_LIMIT)
            .nullish()
            .describe(
              `Zero to ${SEARCH_FIELD_NAMES_LIMIT} field names, labels, or descriptions to search for.
In most cases, each searchFieldName should be an individual word. 
So searchFieldNames will be a list of individual words.`
            )
        })
        .refine(
          input => {
            let searchFieldValues: string[] = input.searchFieldValues ?? [];

            let searchFieldNames: string[] = input.searchFieldNames ?? [];

            let isSearchFieldValueExist: boolean = searchFieldValues.some(
              searchFieldValue => searchFieldValue.trim().length > 0
            );

            let isSearchFieldNameExist: boolean = searchFieldNames.some(
              searchFieldName => searchFieldName.trim().length > 0
            );

            return isSearchFieldValueExist || isSearchFieldNameExist;
          },
          {
            message:
              'Provide at least one non-empty searchFieldValues or searchFieldNames item.'
          }
        ),
      execute: async (input): Promise<SearchModelFieldsToolResult> => {
        let result = await Result.pipe(
          Result.succeed({
            userId: user.userId,
            projectId: projectId,
            repoId: repoId,
            branchId: branchId,
            envId: envId,
            searchFieldValues: input.searchFieldValues ?? [],
            searchFieldNames: input.searchFieldNames ?? []
          }),
          Result.andThen(
            (
              v
            ): Result.ResultAsync<
              SearchModelFieldsToolResult,
              SearchModelFieldsError
            > =>
              this.searchModelFieldsService.searchModelFields({
                userId: v.userId,
                projectId: v.projectId,
                repoId: v.repoId,
                branchId: v.branchId,
                envId: v.envId,
                searchFieldValues: v.searchFieldValues,
                searchFieldNames: v.searchFieldNames
              })
          )
        );

        if (Result.isFailure(result)) {
          throw makeExplorerToolError({ error: result.error });
        }

        let matches: SearchModelFieldsToolResult = result.value;

        return matches;
      }
    });

    return searchTool;
  }
}
