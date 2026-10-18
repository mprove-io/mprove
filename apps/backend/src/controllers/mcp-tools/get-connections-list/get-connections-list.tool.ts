import { UseFilters } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { Result } from '@praha/byethrow';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetConnectionsListService } from '#backend/controllers/connections/get-connections-list/get-connections-list.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema/make-mcp-output-schema';
import { makeMcpToolResponse } from '#backend/functions/make-mcp-tool-response/make-mcp-tool-response';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import { ToolService } from '#backend/services/tool/tool.service';
import {
  MCP_TOOL_GET_CONNECTIONS_LIST,
  MCP_TOOL_GET_CONNECTIONS_LIST_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import type { GetConnectionsListError } from '#common/types/backend/function-errors/get-connections-list-error';
import {
  type McpToolGetConnectionsListInput,
  zMcpToolGetConnectionsListInput
} from '#common/types/backend/mcp-tools/mcp-tool-get-connections-list/mcp-tool-get-connections-list-input';
import { zMcpToolGetConnectionsListOutput } from '#common/types/backend/mcp-tools/mcp-tool-get-connections-list/mcp-tool-get-connections-list-output';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';
import type { ToBackendGetConnectionsListOutput } from '#common/types/backend/routes/connections/get-connections-list/get-connections-list-output';

@McpController()
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
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolGetConnectionsListOutput
    })
  })
  async getConnectionsList(
    @Payload() item: McpToolGetConnectionsListInput,
    @McpRawRequest() request: Request
  ): Promise<ToBackendGetConnectionsListOutput> {
    let result = await Result.pipe(
      Result.succeed({
        projectId: item.projectId,
        envId: item.envId,
        user: (request as any).user as UserTab,
        apiKeyType: (request as any).apiKeyType as ApiKeyType,
        request: request
      }),
      Result.andThrough(v =>
        v.apiKeyType === 'SK'
          ? this.toolService.validateSessionEnvId({
              envId: v.envId,
              request: v.request
            })
          : Result.succeed()
      ),
      Result.andThen(
        (
          v
        ): Result.ResultAsync<
          ToBackendGetConnectionsListOutput,
          GetConnectionsListError
        > =>
          this.getConnectionsListService.getConnectionsList({
            projectId: v.projectId,
            envId: v.envId,
            userId: v.user.userId
          })
      )
    );

    let output: ToBackendGetConnectionsListOutput = makeMcpToolResponse({
      result: result
    });

    return output;
  }
}
