import { UseFilters } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetConnectionSampleService } from '#backend/controllers/connections/get-connection-sample/get-connection-sample.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema';
import { zodStripMcpSchemaId } from '#backend/functions/zod-strip-mcp-schema-id';
import { ToolService } from '#backend/services/tool.service';
import {
  MCP_TOOL_GET_SAMPLE,
  MCP_TOOL_GET_SAMPLE_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import {
  type McpToolGetSampleInput,
  zMcpToolGetSampleInput,
  zMcpToolGetSampleOutput
} from '#common/zod/backend/mcp-tools/mcp-tool-get-sample';
import type { ToBackendGetConnectionSampleOutput } from '#common/zod/backend/routes/connections/get-connection-sample/get-connection-sample-output';

@McpController()
@UseFilters(McpExceptionFilter)
export class GetConnectionSampleTool {
  constructor(
    private getConnectionSampleService: GetConnectionSampleService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_GET_SAMPLE,
    description: MCP_TOOL_GET_SAMPLE_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolGetSampleInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolGetSampleOutput
    })
  })
  async getConnectionSample(
    @Payload() item: McpToolGetSampleInput,
    @McpRawRequest() request: Request
  ) {
    let user = (request as any).user as UserTab;

    let apiKeyType = (request as any).apiKeyType as ApiKeyTypeEnum;

    if (apiKeyType === ApiKeyTypeEnum.SK) {
      this.toolService.validateSessionEnvId({
        envId: item.envId,
        request: request
      });
    }

    let payload: ToBackendGetConnectionSampleOutput =
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
