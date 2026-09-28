import { Injectable, UseFilters } from '@nestjs/common';
import { type Context, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetConnectionsListService } from '#backend/controllers/connections/get-connections-list/get-connections-list.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { zodDeepNullish } from '#backend/functions/zod-deep-nullish';
import { zodStripMcpSchemaId } from '#backend/functions/zod-strip-mcp-schema-id';
import { ToolService } from '#backend/services/tool.service';
import {
  MCP_TOOL_GET_CONNECTIONS_LIST,
  MCP_TOOL_GET_CONNECTIONS_LIST_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import {
  type McpToolGetConnectionsListInput,
  zMcpToolGetConnectionsListInput,
  zMcpToolGetConnectionsListOutput
} from '#common/zod/backend/mcp-tools/mcp-tool-get-connections-list';
import type { ToBackendGetConnectionsListOutput } from '#common/zod/backend/routes/connections/get-connections-list/get-connections-list-output';

@Injectable()
@UseFilters(McpExceptionFilter)
export class GetConnectionsListTool {
  constructor(
    private getConnectionsListService: GetConnectionsListService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_GET_CONNECTIONS_LIST,
    description: MCP_TOOL_GET_CONNECTIONS_LIST_DESCRIPTION,
    parameters: zodStripMcpSchemaId({
      schema: zMcpToolGetConnectionsListInput
    }),
    outputSchema: zodStripMcpSchemaId({
      schema: zodDeepNullish({ schema: zMcpToolGetConnectionsListOutput })
    })
  })
  async getConnectionsList(
    item: McpToolGetConnectionsListInput,
    context: Context,
    request: Request
  ) {
    let user = (request as any).user as UserTab;

    let apiKeyType = (request as any).apiKeyType as ApiKeyTypeEnum;

    if (apiKeyType === ApiKeyTypeEnum.SK) {
      this.toolService.validateSessionEnvId({
        envId: item.envId,
        request: request
      });
    }

    let payload: ToBackendGetConnectionsListOutput =
      await this.getConnectionsListService.getConnectionsList({
        userId: user.userId,
        projectId: item.projectId,
        envId: item.envId
      });

    return payload;
  }
}
