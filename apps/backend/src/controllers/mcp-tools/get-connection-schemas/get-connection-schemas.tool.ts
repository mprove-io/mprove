import { UseFilters } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetConnectionSchemasService } from '#backend/controllers/connections/get-connection-schemas/get-connection-schemas.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema';
import { zodStripMcpSchemaId } from '#backend/functions/zod-strip-mcp-schema-id';
import { ToolService } from '#backend/services/tool.service';
import {
  MCP_TOOL_GET_SCHEMAS,
  MCP_TOOL_GET_SCHEMAS_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import {
  type McpToolGetSchemasInput,
  zMcpToolGetSchemasInput
} from '#common/types/backend/mcp-tools/mcp-tool-get-schemas/mcp-tool-get-schemas-input';
import { zMcpToolGetSchemasOutput } from '#common/types/backend/mcp-tools/mcp-tool-get-schemas/mcp-tool-get-schemas-output';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';
import { processGetConnectionSchemasPayload } from '#node-common/functions/process-get-connection-schemas-payload/process-get-connection-schemas-payload';

@McpController()
@UseFilters(McpExceptionFilter)
export class GetConnectionSchemasTool {
  constructor(
    private getConnectionSchemasService: GetConnectionSchemasService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_GET_SCHEMAS,
    description: MCP_TOOL_GET_SCHEMAS_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolGetSchemasInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolGetSchemasOutput
    })
  })
  async getConnectionSchemas(
    @Payload() item: McpToolGetSchemasInput,
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

    let result = await this.getConnectionSchemasService.getConnectionSchemas({
      userId: user.userId,
      projectId: item.projectId,
      envId: item.envId,
      repoId: item.repoId,
      branchId: item.branchId,
      isRefreshExistingCache: item.isRefreshExistingCache
    });

    return processGetConnectionSchemasPayload({
      payload: result
    });
  }
}
