import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetConnectionsListService } from '#backend/controllers/connections/get-connections-list/get-connections-list.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { MCP_TOOL_GET_CONNECTIONS_LIST } from '#common/constants/top-backend';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { zodDeepNullish } from '#common/functions/zod-deep-nullish';
import {
  type McpToolGetConnectionsListInput,
  zMcpToolGetConnectionsListInput,
  zMcpToolGetConnectionsListOutput
} from '#common/zod/to-backend/connections/mcp-tool-get-connections-list';
import type { ToBackendGetConnectionsListResponsePayload } from '#common/zod/to-backend/connections/to-backend-get-connections-list';

@Injectable()
@UseFilters(McpExceptionFilter)
export class GetConnectionsListTool {
  constructor(
    private getConnectionsListService: GetConnectionsListService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_GET_CONNECTIONS_LIST,
    description:
      'Get connection info (type, API endpoints, header keys, OAuth scopes) for project connections',
    parameters: zMcpToolGetConnectionsListInput,
    outputSchema: zodDeepNullish({ schema: zMcpToolGetConnectionsListOutput })
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

    let payload: ToBackendGetConnectionsListResponsePayload =
      await this.getConnectionsListService.getConnectionsList({
        userId: user.userId,
        projectId: item.projectId,
        envId: item.envId
      });

    return payload;
  }
}
