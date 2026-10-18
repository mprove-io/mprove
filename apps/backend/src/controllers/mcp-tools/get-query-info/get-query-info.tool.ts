import { UseFilters } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { Result } from '@praha/byethrow';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetQueryInfoService } from '#backend/controllers/queries/get-query-info/get-query-info.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema/make-mcp-output-schema';
import { makeMcpToolResponse } from '#backend/functions/make-mcp-tool-response/make-mcp-tool-response';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import { ToolService } from '#backend/services/tool/tool.service';
import {
  MCP_TOOL_GET_QUERY_INFO,
  MCP_TOOL_GET_QUERY_INFO_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { makeId } from '#common/functions/make-id/make-id';
import type { GetQueryInfoError } from '#common/types/backend/function-errors/get-query-info-error';
import {
  type McpToolGetQueryInfoInput,
  zMcpToolGetQueryInfoInput
} from '#common/types/backend/mcp-tools/mcp-tool-get-query-info/mcp-tool-get-query-info-input';
import { zMcpToolGetQueryInfoOutput } from '#common/types/backend/mcp-tools/mcp-tool-get-query-info/mcp-tool-get-query-info-output';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';
import type { ToBackendGetQueryInfoOutput } from '#common/types/backend/routes/query-info/get-query-info/get-query-info-output';

@McpController()
@UseFilters(McpExceptionFilter)
export class GetQueryInfoTool {
  constructor(
    private getQueryInfoService: GetQueryInfoService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_GET_QUERY_INFO,
    description: MCP_TOOL_GET_QUERY_INFO_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolGetQueryInfoInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolGetQueryInfoOutput
    })
  })
  async getQueryInfo(
    @Payload() item: McpToolGetQueryInfoInput,
    @McpRawRequest() request: Request
  ): Promise<ToBackendGetQueryInfoOutput> {
    let result = await Result.pipe(
      Result.succeed({
        projectId: item.projectId,
        repoId: item.repoId,
        branchId: item.branchId,
        envId: item.envId,
        chartId: item.chartId,
        dashboardId: item.dashboardId,
        tileIndex: item.tileIndex,
        reportId: item.reportId,
        rowId: item.rowId,
        timezone: item.timezone,
        timeSpec: item.timeSpec,
        timeRangeFractionBrick: item.timeRangeFractionBrick,
        getMalloy: item.getMalloy,
        getSql: item.getSql,
        getData: item.getData,
        isFetch: item.isFetch,
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
        (
          v
        ): Result.ResultAsync<ToBackendGetQueryInfoOutput, GetQueryInfoError> =>
          this.getQueryInfoService.getQueryInfoResult({
            traceId: makeId(),
            user: v.user,
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId,
            envId: v.envId,
            chartId: v.chartId,
            dashboardId: v.dashboardId,
            tileIndex: v.tileIndex,
            reportId: v.reportId,
            rowId: v.rowId,
            timezone: v.timezone,
            timeSpec: v.timeSpec as any,
            timeRangeFractionBrick: v.timeRangeFractionBrick,
            getMalloy: v.getMalloy,
            getSql: v.getSql,
            getData: v.getData,
            isFetch: v.isFetch
          })
      )
    );

    let output: ToBackendGetQueryInfoOutput = makeMcpToolResponse({
      result: result
    });

    return output;
  }
}
