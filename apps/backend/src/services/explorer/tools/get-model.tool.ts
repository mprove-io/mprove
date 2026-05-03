import { Injectable } from '@nestjs/common';
import { type Tool, tool } from 'ai';
import { z } from 'zod';
import { GetModelService } from '#backend/controllers/models/get-model/get-model.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';

@Injectable()
export class GetModelToolService {
  constructor(private getModelService: GetModelService) {}

  makeTool(item: {
    user: UserTab;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }): Tool {
    let { user, projectId, repoId, branchId, envId } = item;

    return tool({
      description: 'Get model',
      inputSchema: z.object({
        modelId: z.string().describe('The id (name) of the model.')
      }),
      execute: async input => {
        let payload = await this.getModelService.getModel({
          userId: user.userId,
          projectId: projectId,
          repoId: repoId,
          branchId: branchId,
          envId: envId,
          modelId: input.modelId,
          getMalloy: false
        });

        return {
          modelId: payload.model.modelId,
          label: payload.model.label,
          fields: payload.model.fields
        };
      }
    });
  }
}
