import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetQueryInfoService } from '#backend/controllers/query-info/get-query-info/get-query-info.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { MCP_TOOL_GET_QUERY_INFO } from '#common/constants/top-backend';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { makeId } from '#common/functions/make-id';
import { zodDeepNullish } from '#common/functions/zod-deep-nullish';
import {
  type McpToolGetQueryInfoInput,
  zMcpToolGetQueryInfoInput,
  zMcpToolGetQueryInfoOutput
} from '#common/interfaces/to-backend/query-info/mcp-tool-get-query-info';
import { ToBackendGetQueryInfoResponsePayload } from '#common/interfaces/to-backend/query-info/to-backend-get-query-info';

@Injectable()
@UseFilters(McpExceptionFilter)
export class GetQueryInfoTool {
  constructor(
    private getQueryInfoService: GetQueryInfoService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_GET_QUERY_INFO,
    description:
      'Get query info for a chart, dashboard, or report. Returns query status, SQL, malloy and data.',
    parameters: zMcpToolGetQueryInfoInput,
    outputSchema: zodDeepNullish({ schema: zMcpToolGetQueryInfoOutput })
  })
  async getQueryInfo(
    item: McpToolGetQueryInfoInput,
    context: Context,
    request: Request
  ) {
    let user = (request as any).user as UserTab;

    let apiKeyType = (request as any).apiKeyType as ApiKeyTypeEnum;

    if (apiKeyType === ApiKeyTypeEnum.PK) {
      this.toolService.validateUserRepoId({
        repoId: item.repoId,
        userId: user.userId
      });
    } else if (apiKeyType === ApiKeyTypeEnum.SK) {
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

    let payload: ToBackendGetQueryInfoResponsePayload =
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
