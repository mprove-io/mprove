import { UseFilters } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetStateService } from '#backend/controllers/state/get-state/get-state.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema/make-mcp-output-schema';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import { ToolService } from '#backend/services/tool/tool.service';
import {
  MCP_TOOL_GET_STATE,
  MCP_TOOL_GET_STATE_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { makeId } from '#common/functions/make-id/make-id';
import {
  type McpToolGetStateInput,
  zMcpToolGetStateInput
} from '#common/types/backend/mcp-tools/mcp-tool-get-state/mcp-tool-get-state-input';
import { zMcpToolGetStateOutput } from '#common/types/backend/mcp-tools/mcp-tool-get-state/mcp-tool-get-state-output';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';

@McpController()
@UseFilters(McpExceptionFilter)
export class GetStateTool {
  constructor(
    private getStateService: GetStateService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_GET_STATE,
    description: MCP_TOOL_GET_STATE_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolGetStateInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolGetStateOutput
    })
  })
  async getState(
    @Payload() item: McpToolGetStateInput,
    @McpRawRequest() request: Request
  ) {
    let user = (request as any).user as UserTab;

    let apiKeyType = (request as any).apiKeyType as ApiKeyType;

    if (apiKeyType === 'PK') {
      this.toolService.validateUserRepoId({
        repoId: item.repoId,
        userId: user.userId
      });
    } else if (apiKeyType === 'SK') {
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

    let traceId = makeId();

    return await this.getStateService.getState({
      ...item,
      traceId: traceId,
      user: user
    });
  }
}
