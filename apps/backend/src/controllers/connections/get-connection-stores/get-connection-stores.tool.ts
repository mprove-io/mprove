import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { z } from 'zod';
import { GetConnectionStoresService } from '#backend/controllers/connections/get-connection-stores/get-connection-stores.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { MCP_TOOL_GET_STORES } from '#common/constants/top-backend';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { ToBackendGetConnectionStoresResponsePayload } from '#common/interfaces/to-backend/connections/to-backend-get-connection-stores';
import { zStoreItem } from '#common/zod/z-connection-stores/z-store-item';

@Injectable()
@UseFilters(McpExceptionFilter)
export class GetConnectionStoresTool {
  constructor(
    private getConnectionStoresService: GetConnectionStoresService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_GET_STORES,
    description:
      'Get store configuration (API endpoints, header keys, OAuth scopes) for project HTTP API connections',
    parameters: z.object({
      projectId: z.string(),
      envId: z.string()
    }),
    outputSchema: z.object({
      storeItems: z.array(zStoreItem)
    })
  })
  async getConnectionStores(
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

    let payload: ToBackendGetConnectionStoresResponsePayload =
      await this.getConnectionStoresService.getConnectionStores({
        userId: user.userId,
        projectId: item.projectId,
        envId: item.envId
      });

    return payload;
  }
}
