import { UseFilters } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetQueryInfoService } from '#backend/controllers/queries/get-query-info/get-query-info.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema';
import { zodStripMcpSchemaId } from '#backend/functions/zod-strip-mcp-schema-id';
import { ToolService } from '#backend/services/tool.service';
import {
  MCP_TOOL_GET_QUERY_INFO,
  MCP_TOOL_GET_QUERY_INFO_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { makeId } from '#common/functions/make-id/make-id';
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
  ) {
    let user = (request as any).user as UserTab;

    let apiKeyType = (request as any).apiKeyType as ApiKeyType;

    if (apiKeyType === 'PK') {
      this.toolService.validateUserRepoId({
        repoId: item.repoId,
        userId: user.userId
      });
    } else if (apiKeyType === 'SK') {
      this.toolService.validateSessionProjectId({
        projectId: item.projectId,
        request: request
      });
      this.toolService.validateSessionRepoId({
        repoId: item.repoId,
        request: request
      });
      this.toolService.validateSessionBranchId({
        branchId: item.branchId,
        request: request
      });
      this.toolService.validateSessionEnvId({
        envId: item.envId,
        request: request
      });
    }

    let traceId = makeId();

    let payload: ToBackendGetQueryInfoOutput =
      await this.getQueryInfoService.getQueryInfo({
        traceId: traceId,
        user: user,
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
        timeSpec: item.timeSpec as any,
        timeRangeFractionBrick: item.timeRangeFractionBrick,
        getMalloy: item.getMalloy,
        getSql: item.getSql,
        getData: item.getData,
        isFetch: item.isFetch
      });

    return payload;
  }
}
