import { z } from 'zod';
import { zQueryInfoChart } from '#common/zod/backend/query-info/query-info-chart';
import { zQueryInfoDashboard } from '#common/zod/backend/query-info/query-info-dashboard';
import { zQueryInfoReport } from '#common/zod/backend/query-info/query-info-report';

export let zMcpToolGetQueryInfoInput = z
  .object({
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
  })
  .meta({ id: 'McpToolGetQueryInfoInput' });

export let zMcpToolGetQueryInfoOutput = z
  .object({
    chart: zQueryInfoChart.optional(),
    dashboard: zQueryInfoDashboard.optional(),
    report: zQueryInfoReport.optional()
  })
  .meta({ id: 'McpToolGetQueryInfoOutput' });

export type McpToolGetQueryInfoInput = z.infer<
  typeof zMcpToolGetQueryInfoInput
>;

export type McpToolGetQueryInfoOutput = z.infer<
  typeof zMcpToolGetQueryInfoOutput
>;
