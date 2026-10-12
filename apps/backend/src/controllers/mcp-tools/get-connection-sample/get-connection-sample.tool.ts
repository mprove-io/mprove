import { UseFilters } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { Result } from '@praha/byethrow';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetConnectionSampleService } from '#backend/controllers/connections/get-connection-sample/get-connection-sample.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema/make-mcp-output-schema';
import { makeMcpToolResponse } from '#backend/functions/make-mcp-tool-response/make-mcp-tool-response';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import { ToolService } from '#backend/services/tool/tool.service';
import {
  MCP_TOOL_GET_SAMPLE,
  MCP_TOOL_GET_SAMPLE_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import type { GetConnectionSampleError } from '#common/types/backend/function-errors/get-connection-sample-error';
import {
  type McpToolGetSampleInput,
  zMcpToolGetSampleInput
} from '#common/types/backend/mcp-tools/mcp-tool-get-sample/mcp-tool-get-sample-input';
import { zMcpToolGetSampleOutput } from '#common/types/backend/mcp-tools/mcp-tool-get-sample/mcp-tool-get-sample-output';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';
import type { ToBackendGetConnectionSampleOutput } from '#common/types/backend/routes/connections/get-connection-sample/get-connection-sample-output';

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
  ): Promise<ToBackendGetConnectionSampleOutput> {
    let result = await Result.pipe(
      Result.succeed({
        projectId: item.projectId,
        envId: item.envId,
        connectionId: item.connectionId,
        schemaName: item.schemaName,
        tableName: item.tableName,
        columnName: item.columnName,
        offset: item.offset,
        user: (request as any).user as UserTab,
        apiKeyType: (request as any).apiKeyType as ApiKeyType,
        request: request
      }),
      Result.andThrough(v =>
        v.apiKeyType === 'SK'
          ? this.toolService.validateSessionEnvIdResult({
              envId: v.envId,
              request: v.request
            })
          : Result.succeed()
      ),
      Result.andThen(
        (
          v
        ): Result.ResultAsync<
          ToBackendGetConnectionSampleOutput,
          GetConnectionSampleError
        > =>
          this.getConnectionSampleService.getConnectionSampleResult({
            projectId: v.projectId,
            envId: v.envId,
            connectionId: v.connectionId,
            schemaName: v.schemaName,
            tableName: v.tableName,
            columnName: v.columnName,
            offset: v.offset,
            userId: v.user.userId
          })
      )
    );

    let output: ToBackendGetConnectionSampleOutput = makeMcpToolResponse({
      result: result
    });

    return output;
  }
}
