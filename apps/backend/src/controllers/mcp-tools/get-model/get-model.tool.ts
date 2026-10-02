import { UseFilters } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetModelService } from '#backend/controllers/models/get-model/get-model.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema';
import { zodStripMcpSchemaId } from '#backend/functions/zod-strip-mcp-schema-id';
import { ToolService } from '#backend/services/tool.service';
import {
  MCP_TOOL_GET_MODEL,
  MCP_TOOL_GET_MODEL_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import {
  type McpToolGetModelInput,
  zMcpToolGetModelInput,
  zMcpToolGetModelOutput
} from '#common/types/backend/mcp-tools/mcp-tool-get-model';
import { processGetModelPayload } from '#node-common/functions/process-get-model-payload/process-get-model-payload';

@McpController()
@UseFilters(McpExceptionFilter)
export class GetModelTool {
  constructor(
    private getModelService: GetModelService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_GET_MODEL,
    description: MCP_TOOL_GET_MODEL_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolGetModelInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolGetModelOutput
    })
  })
  async getModel(
    @Payload() item: McpToolGetModelInput,
    @McpRawRequest() request: Request
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
