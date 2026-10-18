import { UseFilters } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { Result } from '@praha/byethrow';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetConnectionSchemasService } from '#backend/controllers/connections/get-connection-schemas/get-connection-schemas.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema/make-mcp-output-schema';
import { makeMcpToolResponse } from '#backend/functions/make-mcp-tool-response/make-mcp-tool-response';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import { ToolService } from '#backend/services/tool/tool.service';
import {
  MCP_TOOL_GET_SCHEMAS,
  MCP_TOOL_GET_SCHEMAS_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import type { GetConnectionSchemasError } from '#common/types/backend/function-errors/get-connection-schemas-error';
import {
  type McpToolGetSchemasInput,
  zMcpToolGetSchemasInput
} from '#common/types/backend/mcp-tools/mcp-tool-get-schemas/mcp-tool-get-schemas-input';
import {
  type McpToolGetSchemasOutput,
  zMcpToolGetSchemasOutput
} from '#common/types/backend/mcp-tools/mcp-tool-get-schemas/mcp-tool-get-schemas-output';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';
import type { ToBackendGetConnectionSchemasOutput } from '#common/types/backend/routes/connections/get-connection-schemas/get-connection-schemas-output';
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
  ): Promise<McpToolGetSchemasOutput> {
    let result = await Result.pipe(
      Result.succeed({
        projectId: item.projectId,
        repoId: item.repoId,
        branchId: item.branchId,
        envId: item.envId,
        isRefreshExistingCache: item.isRefreshExistingCache,
        user: (request as any).user as UserTab,
        apiKeyType: (request as any).apiKeyType as ApiKeyType,
        request: request
      }),
      Result.andThrough(v =>
        v.apiKeyType === 'PK'
          ? this.toolService.validateUserRepoId({
              repoId: v.repoId,
              userId: v.user.userId
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.apiKeyType === 'SK'
          ? this.toolService.validateSessionRepoId({
              repoId: v.repoId,
              request: v.request
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.apiKeyType === 'SK'
          ? this.toolService.validateSessionBranchId({
              branchId: v.branchId,
              request: v.request
            })
          : Result.succeed()
      ),
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
          ToBackendGetConnectionSchemasOutput,
          GetConnectionSchemasError
        > =>
          this.getConnectionSchemasService.getConnectionSchemasResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId,
            envId: v.envId,
            isRefreshExistingCache: v.isRefreshExistingCache,
            userId: v.user.userId
          })
      ),
      Result.map(
        (v): McpToolGetSchemasOutput =>
          processGetConnectionSchemasPayload({ payload: v })
      )
    );

    let output: McpToolGetSchemasOutput = makeMcpToolResponse({
      result: result
    });

    return output;
  }
}
