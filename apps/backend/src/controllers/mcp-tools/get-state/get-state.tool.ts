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
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import { ToolService } from '#backend/services/tool/tool.service';
import {
  MCP_TOOL_GET_STATE,
  MCP_TOOL_GET_STATE_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { makeId } from '#common/functions/make-id/make-id';
import type { GetStateError } from '#common/types/backend/function-errors/get-state-error';
import {
  type McpToolGetStateInput,
  zMcpToolGetStateInput
} from '#common/types/backend/mcp-tools/mcp-tool-get-state/mcp-tool-get-state-input';
import {
  type McpToolGetStateOutput,
  zMcpToolGetStateOutput
} from '#common/types/backend/mcp-tools/mcp-tool-get-state/mcp-tool-get-state-output';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';

@McpController()
@UseFilters(McpExceptionFilter)
export class GetStateTool {
  constructor(
    private getStateService: GetStateService,
    private toolService: ToolService
  ) {}

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
          ? this.toolService.validateSessionProjectId({
              projectId: v.projectId,
              request: v.request
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
        (v): Result.ResultAsync<McpToolGetStateOutput, GetStateError> =>
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
