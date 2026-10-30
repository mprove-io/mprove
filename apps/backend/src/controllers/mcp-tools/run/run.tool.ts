import { UseFilters } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { Result } from '@praha/byethrow';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { RunService } from '#backend/controllers/run/run/run.service';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/mcp/make-mcp-output-schema/make-mcp-output-schema';
import { makeMcpToolResponse } from '#backend/functions/mcp/make-mcp-tool-response/make-mcp-tool-response';
import { validateMcpProjectRepoBranchEnvAccess } from '#backend/functions/mcp/validate-mcp-project-repo-branch-env-access/validate-mcp-project-repo-branch-env-access';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import {
  MCP_TOOL_RUN,
  MCP_TOOL_RUN_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { makeId } from '#common/functions/make-id/make-id';
import {
  type McpToolRunInput,
  zMcpToolRunInput
} from '#common/types/backend/mcp-tools/mcp-tool-run/mcp-tool-run-input';
import { zMcpToolRunOutput } from '#common/types/backend/mcp-tools/mcp-tool-run/mcp-tool-run-output';
import type { McpApiKeyParsed } from '#common/types/backend/parts/api-key/mcp-api-key-parsed';
import type { ToBackendRunOutput } from '#common/types/backend/routes/run/run/run-output';

@McpController()
@UseFilters(McpExceptionFilter)
export class RunTool {
  constructor(private runService: RunService) {}

  @Tool({
    name: MCP_TOOL_RUN,
    description: MCP_TOOL_RUN_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolRunInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolRunOutput
    })
  })
  async run(
    @Payload() item: McpToolRunInput,
    @McpRawRequest() request: Request
  ): Promise<ToBackendRunOutput> {
    let result = await Result.pipe(
      Result.succeed({
        projectId: item.projectId,
        repoId: item.repoId,
        branchId: item.branchId,
        envId: item.envId,
        concurrency: item.concurrency,
        wait: item.wait,
        sleep: item.sleep,
        dashboardIds: item.dashboardIds,
        chartIds: item.chartIds,
        noDashboards: item.noDashboards,
        noCharts: item.noCharts,
        getDashboards: item.getDashboards,
        getCharts: item.getCharts,
        reportIds: item.reportIds,
        noReports: item.noReports,
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
        this.runService.run({
          projectId: v.projectId,
          repoId: v.repoId,
          branchId: v.branchId,
          envId: v.envId,
          concurrency: v.concurrency,
          wait: v.wait,
          sleep: v.sleep,
          dashboardIds: v.dashboardIds,
          chartIds: v.chartIds,
          noDashboards: v.noDashboards,
          noCharts: v.noCharts,
          getDashboards: v.getDashboards,
          getCharts: v.getCharts,
          reportIds: v.reportIds,
          noReports: v.noReports,
          getReports: v.getReports,
          traceId: makeId(),
          user: v.user
        })
      )
    );

    let output: ToBackendRunOutput = makeMcpToolResponse({ result: result });

    return output;
  }
}
