import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetConnectionSampleService } from '#backend/controllers/connections/get-connection-sample/get-connection-sample.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { MCP_TOOL_GET_SAMPLE } from '#common/constants/top-backend';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { zodDeepNullish } from '#common/functions/zod-deep-nullish';
import {
  type McpToolGetSampleInput,
  zMcpToolGetSampleInput,
  zMcpToolGetSampleOutput
} from '#common/zod/to-backend/connections/mcp-tool-get-sample';
import type { ToBackendGetConnectionSampleResponsePayload } from '#common/zod/to-backend/connections/to-backend-get-connection-sample';

@Injectable()
@UseFilters(McpExceptionFilter)
export class GetConnectionSampleTool {
  constructor(
    private getConnectionSampleService: GetConnectionSampleService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_GET_SAMPLE,
    description:
      'Fetch sample data rows from a database table or column for a project connection',
    parameters: zMcpToolGetSampleInput,
    outputSchema: zodDeepNullish({ schema: zMcpToolGetSampleOutput })
  })
  async getConnectionSample(
    item: McpToolGetSampleInput,
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

    let payload: ToBackendGetConnectionSampleResponsePayload =
      await this.getConnectionSampleService.getConnectionSample({
        userId: user.userId,
        projectId: item.projectId,
        envId: item.envId,
        connectionId: item.connectionId,
        schemaName: item.schemaName,
        tableName: item.tableName,
        columnName: item.columnName,
        offset: item.offset
      });

    return payload;
  }
}
