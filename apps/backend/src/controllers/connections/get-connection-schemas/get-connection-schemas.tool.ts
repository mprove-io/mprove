import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetConnectionSchemasService } from '#backend/controllers/connections/get-connection-schemas/get-connection-schemas.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { MCP_TOOL_GET_SCHEMAS } from '#common/constants/top-backend';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { zodDeepNullish } from '#common/functions/zod-deep-nullish';
import {
  type McpToolGetSchemasInput,
  zMcpToolGetSchemasInput,
  zMcpToolGetSchemasOutput
} from '#common/zod/to-backend/connections/mcp-tool-get-schemas';
import { processGetConnectionSchemasPayload } from '#node-common/functions/process-get-connection-schemas-payload';

@Injectable()
@UseFilters(McpExceptionFilter)
export class GetConnectionSchemasTool {
  constructor(
    private getConnectionSchemasService: GetConnectionSchemasService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_GET_SCHEMAS,
    description:
      'Fetch database schemas (tables, columns, relationships, indexes) for project SQL connections',
    parameters: zMcpToolGetSchemasInput,
    outputSchema: zodDeepNullish({ schema: zMcpToolGetSchemasOutput })
  })
  async getConnectionSchemas(
    item: McpToolGetSchemasInput,
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
