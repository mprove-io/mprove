import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { z } from 'zod';
import { GetStateService } from '#backend/controllers/state/get-state/get-state.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { MCP_TOOL_GET_STATE } from '#common/constants/top-backend';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { makeId } from '#common/functions/make-id';
import { zMproveValidationError } from '#common/zod/z-state/z-mprove-validation-error';
import { zStateChartItem } from '#common/zod/z-state/z-state-chart-item';
import { zStateDashboardItem } from '#common/zod/z-state/z-state-dashboard-item';
import { zStateMetricItem } from '#common/zod/z-state/z-state-metric-item';
import { zStateModelItem } from '#common/zod/z-state/z-state-model-item';
import { zStateRepo } from '#common/zod/z-state/z-state-repo';
import { zStateReportItem } from '#common/zod/z-state/z-state-report-item';

@Injectable()
@UseFilters(McpExceptionFilter)
export class GetStateTool {
  constructor(
    private getStateService: GetStateService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_GET_STATE,
    description:
      'Get project state: models, dashboards, charts, reports, metrics, validation errors, and repo info',
    parameters: z.object({
      projectId: z.string().describe('Project ID'),
      repoId: z.string().describe('Repository ID'),
      branchId: z.string().describe('Git branch name'),
      envId: z.string().describe('Environment ID'),
      isFetch: z.boolean().describe('Fetch latest data from the database'),
      getErrors: z.boolean().describe('Include validation errors in output'),
      getRepo: z.boolean().describe('Include repo info in output'),
      getRepoNodes: z.boolean().describe('Include repo file nodes in output'),
      getModels: z.boolean().describe('Include models in output'),
      getDashboards: z.boolean().describe('Include dashboards in output'),
      getCharts: z.boolean().describe('Include charts in output'),
      getMetrics: z.boolean().describe('Include metrics in output'),
      getReports: z.boolean().describe('Include reports in output')
    }),
    outputSchema: z.object({
      needValidate: z.boolean(),
      structId: z.string(),
      validationErrorsTotal: z.number(),
      modelsTotal: z.number(),
      chartsTotal: z.number(),
      dashboardsTotal: z.number(),
      reportsTotal: z.number(),
      builderUrl: z.string(),
      validationErrors: z.array(zMproveValidationError),
      modelItems: z.array(zStateModelItem),
      chartItems: z.array(zStateChartItem),
      dashboardItems: z.array(zStateDashboardItem),
      reportItems: z.array(zStateReportItem),
      metricItems: z.array(zStateMetricItem),
      repo: zStateRepo.optional()
    })
  })
  async getState(
    item: {
      projectId: string;
      repoId: string;
      branchId: string;
      envId: string;
      isFetch: boolean;
      getErrors: boolean;
      getRepo: boolean;
      getRepoNodes: boolean;
      getModels: boolean;
      getDashboards: boolean;
      getCharts: boolean;
      getMetrics: boolean;
      getReports: boolean;
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

    return await this.getStateService.getState({
      traceId: traceId,
      user: user,
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
      getReports: item.getReports
    });
  }
}
