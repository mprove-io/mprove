import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { z } from 'zod';
import { GetStateService } from '#backend/controllers/state/get-state/get-state.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { makeId } from '#common/functions/make-id';
import { ToBackendGetStateResponsePayload } from '#common/interfaces/to-backend/state/to-backend-get-state';
import { zStateChartItem } from '#common/zod/z-state-chart-item';
import { zStateDashboardItem } from '#common/zod/z-state-dashboard-item';
import { zStateErrorItem } from '#common/zod/z-state-error-item';
import { zStateMetricItem } from '#common/zod/z-state-metric-item';
import { zStateModelItem } from '#common/zod/z-state-model-item';
import { zStateReportItem } from '#common/zod/z-state-report-item';

@Injectable()
@UseFilters(McpExceptionFilter)
export class GetStateTool {
  constructor(
    private getStateService: GetStateService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: 'get-state',
    description:
      'Get project state: models, dashboards, charts, reports, metrics, validation errors, and repo info',
    parameters: z.object({
      projectId: z.string(),
      repoId: z.string(),
      branchId: z.string(),
      envId: z.string(),
      isFetch: z.boolean()
    }),
    outputSchema: z.object({
      needValidate: z.boolean(),
      errorsTotal: z.number(),
      errors: z.array(zStateErrorItem),
      models: z.array(zStateModelItem),
      charts: z.array(zStateChartItem),
      dashboards: z.array(zStateDashboardItem),
      reports: z.array(zStateReportItem),
      metrics: z.array(zStateMetricItem),
      builderUrl: z.string()
    })
  })
  async getState(
    item: {
      projectId: string;
      repoId: string;
      branchId: string;
      envId: string;
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

    let payload: ToBackendGetStateResponsePayload =
      await this.getStateService.getState({
        traceId: traceId,
        user: user,
        projectId: item.projectId,
        repoId: item.repoId,
        branchId: item.branchId,
        envId: item.envId,
        isFetch: item.isFetch
      });

    return payload;
  }
}
