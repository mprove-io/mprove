import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { z } from 'zod';
import { RunService } from '#backend/controllers/run/run/run.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { makeId } from '#common/functions/make-id';
import type { ToBackendRunResponsePayload } from '#common/interfaces/to-backend/run/to-backend-run';
import { zRunChart } from '#common/zod/z-run/z-run-chart';
import { zRunDashboard } from '#common/zod/z-run/z-run-dashboard';
import { zRunQueriesStats } from '#common/zod/z-run/z-run-queries-stats';

@Injectable()
@UseFilters(McpExceptionFilter)
export class RunTool {
  constructor(
    private runService: RunService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: 'run',
    description:
      'Run dashboards and charts queries. Returns query statuses and statistics.',
    parameters: z.object({
      projectId: z.string(),
      repoId: z.string(),
      branchId: z.string(),
      envId: z.string(),
      concurrency: z.number().optional(),
      wait: z.boolean(),
      sleep: z.number().optional(),
      dashboardIds: z.string().optional(),
      chartIds: z.string().optional(),
      noDashboards: z.boolean(),
      noCharts: z.boolean()
    }),
    outputSchema: z.object({
      charts: z.array(zRunChart),
      dashboards: z.array(zRunDashboard),
      queriesStats: zRunQueriesStats
    })
  })
  async run(
    item: {
      projectId: string;
      repoId: string;
      branchId: string;
      envId: string;
      concurrency?: number;
      wait: boolean;
      sleep?: number;
      dashboardIds?: string;
      chartIds?: string;
      noDashboards: boolean;
      noCharts: boolean;
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

    let payload: ToBackendRunResponsePayload = await this.runService.run({
      traceId: traceId,
      user: user,
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
      noCharts: item.noCharts
    });

    return payload;
  }
}
