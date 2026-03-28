import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { z } from 'zod';
import { GetModelService } from '#backend/controllers/models/get-model/get-model.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { MCP_TOOL_GET_MODEL } from '#common/constants/top-backend';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { zModel } from '#common/zod/z-model/z-model';
import { processGetModelPayload } from '#node-common/functions/process-get-model-payload';

@Injectable()
@UseFilters(McpExceptionFilter)
export class GetModelTool {
  constructor(
    private getModelService: GetModelService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_GET_MODEL,
    description:
      'Get a model definition including its fields, dimensions, measures, and access info',
    parameters: z.object({
      projectId: z.string(),
      repoId: z.string(),
      branchId: z.string(),
      envId: z.string(),
      modelId: z.string(),
      getMalloy: z.boolean().default(false)
    }),
    outputSchema: z.object({
      needValidate: z.boolean(),
      model: zModel
    })
  })
  async getModel(
    item: {
      projectId: string;
      repoId: string;
      branchId: string;
      envId: string;
      modelId: string;
      getMalloy: boolean;
    },
    context: Context,
    request: Request
  ) {
    let user = (request as any).user as UserTab;

    let apiKeyType = (request as any).apiKeyType as ApiKeyTypeEnum;

    if (apiKeyType === ApiKeyTypeEnum.PK) {
      this.toolService.validateUserRepoId({
        repoId: item.repoId,
        userId: user.userId
      });
    } else if (apiKeyType === ApiKeyTypeEnum.SK) {
      this.toolService.validateSessionProjectId({
        projectId: item.projectId,
        request: request
      });
      this.toolService.validateSessionRepoId({
        repoId: item.repoId,
        request: request
      });
      this.toolService.validateSessionBranchId({
        branchId: item.branchId,
        request: request
      });
      this.toolService.validateSessionEnvId({
        envId: item.envId,
        request: request
      });
    }

    let result = await this.getModelService.getModel({
      userId: user.userId,
      projectId: item.projectId,
      repoId: item.repoId,
      branchId: item.branchId,
      envId: item.envId,
      modelId: item.modelId,
      getMalloy: item.getMalloy
    });

    return processGetModelPayload({
      payload: result
    });
  }
}
