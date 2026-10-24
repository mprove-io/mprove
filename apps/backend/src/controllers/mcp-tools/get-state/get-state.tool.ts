import { UseFilters } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { Result } from '@praha/byethrow';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetStateService } from '#backend/controllers/state/get-state/get-state.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema/make-mcp-output-schema';
import { makeMcpToolResponse } from '#backend/functions/make-mcp-tool-response/make-mcp-tool-response';
import { validateMcpProjectRepoBranchEnvAccess } from '#backend/functions/validate-mcp/validate-mcp-project-repo-branch-env-access/validate-mcp-project-repo-branch-env-access';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import {
  MCP_TOOL_GET_STATE,
  MCP_TOOL_GET_STATE_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { makeId } from '#common/functions/make-id/make-id';
import {
  type McpToolGetStateInput,
  zMcpToolGetStateInput
} from '#common/types/backend/mcp-tools/mcp-tool-get-state/mcp-tool-get-state-input';
import {
  type McpToolGetStateOutput,
  zMcpToolGetStateOutput
} from '#common/types/backend/mcp-tools/mcp-tool-get-state/mcp-tool-get-state-output';
import type { McpApiKeyParsed } from '#common/types/backend/parts/api-key/mcp-api-key-parsed';

@McpController()
@UseFilters(McpExceptionFilter)
export class GetStateTool {
  constructor(private getStateService: GetStateService) {}

  @Tool({
    name: MCP_TOOL_GET_STATE,
    description: MCP_TOOL_GET_STATE_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolGetStateInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolGetStateOutput
    })
  })
  async getState(
    @Payload() item: McpToolGetStateInput,
    @McpRawRequest() request: Request
  ): Promise<McpToolGetStateOutput> {
    let result = await Result.pipe(
      Result.succeed({
        projectId: item.projectId,
        repoId: item.repoId,
        branchId: item.branchId,
        envId: item.envId,
        isFetch: item.isFetch,
        getErrors: item.getErrors,
        getRepo: item.getRepo,
        getRepoNodes: item.getRepoNodes,
        getModels: item.getModels,
        getDashboards: item.getDashboards,
        getCharts: item.getCharts,
        getMetrics: item.getMetrics,
        getReports: item.getReports,
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
        this.getStateService.getState({
          projectId: v.projectId,
          repoId: v.repoId,
          branchId: v.branchId,
          envId: v.envId,
          isFetch: v.isFetch,
          getErrors: v.getErrors,
          getRepo: v.getRepo,
          getRepoNodes: v.getRepoNodes,
          getModels: v.getModels,
          getDashboards: v.getDashboards,
          getCharts: v.getCharts,
          getMetrics: v.getMetrics,
          getReports: v.getReports,
          traceId: makeId(),
          user: v.user
        })
      )
    );

    let output: McpToolGetStateOutput = makeMcpToolResponse({ result: result });

    return output;
  }
}
