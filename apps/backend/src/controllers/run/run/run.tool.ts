import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { z } from 'zod';
import { RunService } from '#backend/controllers/run/run/run.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { MCP_TOOL_RUN } from '#common/constants/top-backend';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { makeId } from '#common/functions/make-id';
import type { ToBackendRunResponsePayload } from '#common/interfaces/to-backend/run/to-backend-run';
import { zRunChart } from '#common/zod/z-run/z-run-chart';
import { zRunDashboard } from '#common/zod/z-run/z-run-dashboard';
import { zRunQueriesStats } from '#common/zod/z-run/z-run-queries-stats';
import { zRunReport } from '#common/zod/z-run/z-run-report';

@Injectable()
@UseFilters(McpExceptionFilter)
export class RunTool {
  constructor(
    private runService: RunService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_RUN,
    description:
      'Run dashboards, charts, and reports queries. Returns query statuses and statistics.',
    parameters: z.object({
      projectId: z.string().describe('Project ID'),
      repoId: z.string().describe('Repository ID'),
      branchId: z.string().describe('Git branch name'),
      envId: z.string().describe('Environment ID'),
      concurrency: z
        .number()
        .nullish()
        .describe('Max concurrent queries. Omit to use server default.'),
      wait: z.boolean().describe('Wait for queries completion'),
      sleep: z
        .number()
        .nullish()
        .describe(
          'Seconds to sleep between query status checks. Omit to use default of 3 seconds.'
        ),
      dashboardIds: z
        .string()
        .nullish()
        .describe(
          'Comma-separated dashboard IDs to run. Omit to run all dashboards.'
        ),
      chartIds: z
        .string()
        .nullish()
        .describe('Comma-separated chart IDs to run. Omit to run all charts.'),
      noDashboards: z.boolean().describe('Do not run dashboards'),
      noCharts: z.boolean().describe('Do not run charts'),
      getDashboards: z.boolean().describe('Include dashboards in output'),
      getCharts: z.boolean().describe('Include charts in output'),
      reportIds: z
        .string()
        .nullish()
        .describe(
          'Comma-separated report IDs to run. Omit to run all reports.'
        ),
      noReports: z.boolean().describe('Do not run reports'),
      getReports: z.boolean().describe('Include reports in output')
    }),
    outputSchema: z.object({
      charts: z.array(zRunChart),
      dashboards: z.array(zRunDashboard),
      reports: z.array(zRunReport),
      errorCharts: z.array(zRunChart),
      errorDashboards: z.array(zRunDashboard),
      errorReports: z.array(zRunReport),
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
      getDashboards: boolean;
      getCharts: boolean;
      reportIds?: string;
      noReports: boolean;
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
      noCharts: item.noCharts,
      getDashboards: item.getDashboards,
      getCharts: item.getCharts,
      reportIds: item.reportIds,
      noReports: item.noReports,
      getReports: item.getReports
    });

    return payload;
  }
}
