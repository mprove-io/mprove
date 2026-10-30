import { UseFilters } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { Result } from '@praha/byethrow';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetConnectionSchemasService } from '#backend/controllers/connections/get-connection-schemas/get-connection-schemas.service';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/mcp/make-mcp-output-schema/make-mcp-output-schema';
import { makeMcpToolResponse } from '#backend/functions/mcp/make-mcp-tool-response/make-mcp-tool-response';
import { validateMcpRepoBranchEnvAccess } from '#backend/functions/mcp/validate-mcp-repo-branch-env-access/validate-mcp-repo-branch-env-access';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import {
  MCP_TOOL_GET_SCHEMAS,
  MCP_TOOL_GET_SCHEMAS_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import {
  type McpToolGetSchemasInput,
  zMcpToolGetSchemasInput
} from '#common/types/backend/mcp-tools/mcp-tool-get-schemas/mcp-tool-get-schemas-input';
import {
  type McpToolGetSchemasOutput,
  zMcpToolGetSchemasOutput
} from '#common/types/backend/mcp-tools/mcp-tool-get-schemas/mcp-tool-get-schemas-output';
import type { McpApiKeyParsed } from '#common/types/backend/parts/api-key/mcp-api-key-parsed';
import { processGetConnectionSchemasPayload } from '#node-common/functions/process-get-connection-schemas-payload/process-get-connection-schemas-payload';

@McpController()
@UseFilters(McpExceptionFilter)
export class GetConnectionSchemasTool {
  constructor(
    private getConnectionSchemasService: GetConnectionSchemasService
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
        apiKeyParsed: (request as any).apiKeyParsed as McpApiKeyParsed
      }),
      Result.andThrough(v =>
        validateMcpRepoBranchEnvAccess({
          repoId: v.repoId,
          branchId: v.branchId,
          envId: v.envId,
          apiKeyParsed: v.apiKeyParsed
        })
      ),
      Result.andThen(v =>
        this.getConnectionSchemasService.getConnectionSchemas({
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
