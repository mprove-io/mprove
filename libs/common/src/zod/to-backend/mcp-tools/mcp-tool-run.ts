import { z } from 'zod';
import { zRunChart } from '#common/zod/backend/run/run-chart';
import { zRunDashboard } from '#common/zod/backend/run/run-dashboard';
import { zRunQueriesStats } from '#common/zod/backend/run/run-queries-stats';
import { zRunReport } from '#common/zod/backend/run/run-report';

export let zMcpToolRunInput = z
  .object({
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
      .describe('Comma-separated report IDs to run. Omit to run all reports.'),
    noReports: z.boolean().describe('Do not run reports'),
    getReports: z.boolean().describe('Include reports in output')
  })
  .meta({ id: 'McpToolRunInput' });

export let zMcpToolRunOutput = z
  .object({
    charts: z.array(zRunChart),
    dashboards: z.array(zRunDashboard),
    reports: z.array(zRunReport),
    errorCharts: z.array(zRunChart),
    errorDashboards: z.array(zRunDashboard),
    errorReports: z.array(zRunReport),
    queriesStats: zRunQueriesStats
  })
  .meta({ id: 'McpToolRunOutput' });

export type McpToolRunInput = z.infer<typeof zMcpToolRunInput>;

export type McpToolRunOutput = z.infer<typeof zMcpToolRunOutput>;
