import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { z } from 'zod';
import { GetQueryInfoService } from '#backend/controllers/query-info/get-query-info/get-query-info.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { MCP_TOOL_GET_QUERY_INFO } from '#common/constants/top-backend';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { makeId } from '#common/functions/make-id';
import { ToBackendGetQueryInfoResponsePayload } from '#common/interfaces/to-backend/query-info/to-backend-get-query-info';
import { zQueryInfoChart } from '#common/zod/z-query-info/z-query-info-chart';
import { zQueryInfoDashboard } from '#common/zod/z-query-info/z-query-info-dashboard';
import { zQueryInfoReport } from '#common/zod/z-query-info/z-query-info-report';

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
    parameters: z.object({
      projectId: z.string().describe('Project ID'),
      repoId: z.string().describe('Repository ID'),
      branchId: z.string().describe('Git branch name'),
      envId: z.string().describe('Environment ID'),
      chartId: z
        .string()
        .nullish()
        .describe(
          'Chart ID to get query info for. Omit if querying a dashboard or report.'
        ),
      dashboardId: z
        .string()
        .nullish()
        .describe(
          'Dashboard ID to get query info for. Omit if querying a chart or report.'
        ),
      tileIndex: z
        .number()
        .nullish()
        .describe('Dashboard tile index. Omit to get all tiles.'),
      reportId: z
        .string()
        .nullish()
        .describe(
          'Report ID to get query info for. Omit if querying a chart or dashboard.'
        ),
      rowId: z
        .string()
        .nullish()
        .describe('Report row ID. Omit to get all rows.'),
      timezone: z.string().describe('Timezone, e.g. "UTC"'),
      timeSpec: z
        .string()
        .nullish()
        .describe(
          'Time specification for the query. Omit to use default time range.'
        ),
      timeRangeFractionBrick: z
        .string()
        .nullish()
        .describe('Time range fraction brick. Omit to use default.'),
      getMalloy: z.boolean().describe('Include Malloy query in output'),
      getSql: z.boolean().describe('Include SQL query in output'),
      getData: z.boolean().describe('Include query data in output'),
      isFetch: z.boolean().describe('Fetch latest data from the database')
    }),
    outputSchema: z.object({
      chart: zQueryInfoChart.optional(),
      dashboard: zQueryInfoDashboard.optional(),
      report: zQueryInfoReport.optional()
    })
  })
  async getQueryInfo(
    item: {
      projectId: string;
      repoId: string;
      branchId: string;
      envId: string;
      chartId?: string;
      dashboardId?: string;
      tileIndex?: number;
      reportId?: string;
      rowId?: string;
      timezone: string;
      timeSpec?: string;
      timeRangeFractionBrick?: string;
      getMalloy: boolean;
      getSql: boolean;
      getData: boolean;
      isFetch: boolean;
    },
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
