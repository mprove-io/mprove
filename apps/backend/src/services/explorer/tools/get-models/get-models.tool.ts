import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { type Tool, tool } from 'ai';
import { z } from 'zod';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { makeExplorerToolError } from '#backend/functions/make-explorer-tool-error/make-explorer-tool-error';
import { ExplorerModelPartsService } from '#backend/services/explorer/explorer-model-parts/explorer-model-parts.service';
import type { GetExplorerModelsOutput } from '#backend/services/explorer/types/get-explorer-models-output';
import type { GetExplorerModelsError } from '#common/types/backend/function-errors/get-explorer-models-error';

@Injectable()
export class GetModelsToolService {
  constructor(private explorerModelPartsService: ExplorerModelPartsService) {}

  makeTool(item: {
    user: UserTab;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    traceId: string;
  }): Tool {
    let { user, projectId, repoId, branchId, envId, traceId } = item;

    let modelsTool: Tool = tool({
      description:
        'Get models by model id. Returns model metadata, fields, and the top source Malloy file content.',
      inputSchema: z.object({
        modelIds: z
          .array(z.string())
          .describe('Model ids to retrieve, e.g. ["orders", "customers"].')
      }),
      execute: async (input): Promise<GetExplorerModelsOutput> => {
        let result = await Result.pipe(
          Result.succeed({
            userId: user.userId,
            projectId: projectId,
            repoId: repoId,
            branchId: branchId,
            envId: envId,
            traceId: traceId,
            modelIds: input.modelIds
          }),
          Result.andThen(
            (
              v
            ): Result.ResultAsync<
              GetExplorerModelsOutput,
              GetExplorerModelsError
            > =>
              this.explorerModelPartsService.getExplorerModelsResult({
                userId: v.userId,
                projectId: v.projectId,
                repoId: v.repoId,
                branchId: v.branchId,
                envId: v.envId,
                traceId: v.traceId,
                modelIds: v.modelIds
              })
          )
        );

        if (Result.isFailure(result)) {
          throw makeExplorerToolError({ error: result.error });
        }

        let output: GetExplorerModelsOutput = result.value;

        return output;
      }
    });

    return modelsTool;
  }
}
