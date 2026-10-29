import { UseFilters } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { Result } from '@praha/byethrow';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetModelService } from '#backend/controllers/models/get-model/get-model.service';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema/make-mcp-output-schema';
import { makeMcpToolResponse } from '#backend/functions/make-mcp-tool-response/make-mcp-tool-response';
import { validateMcpProjectRepoBranchEnvAccess } from '#backend/functions/validate-mcp/validate-mcp-project-repo-branch-env-access/validate-mcp-project-repo-branch-env-access';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import {
  MCP_TOOL_GET_MODEL,
  MCP_TOOL_GET_MODEL_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import {
  type McpToolGetModelInput,
  zMcpToolGetModelInput
} from '#common/types/backend/mcp-tools/mcp-tool-get-model/mcp-tool-get-model-input';
import {
  type McpToolGetModelOutput,
  zMcpToolGetModelOutput
} from '#common/types/backend/mcp-tools/mcp-tool-get-model/mcp-tool-get-model-output';
import type { McpApiKeyParsed } from '#common/types/backend/parts/api-key/mcp-api-key-parsed';
import { processGetModelPayload } from '#node-common/functions/process-get-model-payload/process-get-model-payload';

@McpController()
@UseFilters(McpExceptionFilter)
export class GetModelTool {
  constructor(private getModelService: GetModelService) {}

  @Tool({
    name: MCP_TOOL_GET_MODEL,
    description: MCP_TOOL_GET_MODEL_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolGetModelInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolGetModelOutput
    })
  })
  async getModel(
    @Payload() item: McpToolGetModelInput,
    @McpRawRequest() request: Request
  ): Promise<McpToolGetModelOutput> {
    let result = await Result.pipe(
      Result.succeed({
        projectId: item.projectId,
        repoId: item.repoId,
        branchId: item.branchId,
        envId: item.envId,
        modelId: item.modelId,
        getMalloy: item.getMalloy,
        user: (request as any).user as UserTab,
        apiKeyParsed: (request as any).apiKeyParsed as McpApiKeyParsed
      }),
      Result.andThrough(v =>
        validateMcpProjectRepoBranchEnvAccess({
          projectId: v.projectId,
          repoId: v.repoId,
          branchId: v.branchId,
          envId: v.envId,
          apiKeyParsed: v.apiKeyParsed
        })
      ),
      Result.andThen(v =>
        this.getModelService.getModel({
          projectId: v.projectId,
          repoId: v.repoId,
          branchId: v.branchId,
          envId: v.envId,
          modelId: v.modelId,
          getMalloy: v.getMalloy,
          userId: v.user.userId
        })
      ),
      Result.map(
        (v): McpToolGetModelOutput => processGetModelPayload({ payload: v })
      )
    );

    let output: McpToolGetModelOutput = makeMcpToolResponse({ result: result });

    return output;
  }
}
