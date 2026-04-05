import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { z } from 'zod';
import { GetConnectionsListService } from '#backend/controllers/connections/get-connections-list/get-connections-list.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { MCP_TOOL_GET_CONNECTIONS_LIST } from '#common/constants/top-backend';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { ToBackendGetConnectionsListResponsePayload } from '#common/interfaces/to-backend/connections/to-backend-get-connections-list';
import { zConnectionItem } from '#common/zod/z-connection-stores/z-connection-item';

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
    parameters: z.object({
      projectId: z.string().describe('Project ID'),
      envId: z.string().describe('Environment ID')
    }),
    outputSchema: z.object({
      connectionItems: z.array(zConnectionItem)
    })
  })
  async getConnectionsList(
    item: {
      projectId: string;
      envId: string;
    },
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
