import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type QueryInfoChart,
  zQueryInfoChart
} from '#common/types/backend/parts/query-info/query-info-chart';
import {
  type QueryInfoDashboard,
  zQueryInfoDashboard
} from '#common/types/backend/parts/query-info/query-info-dashboard';
import {
  type QueryInfoReport,
  zQueryInfoReport
} from '#common/types/backend/parts/query-info/query-info-report';

export type McpToolGetQueryInfoInput = {
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
};

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

assertTypesEqual<
  McpToolGetQueryInfoInput,
  z.infer<typeof zMcpToolGetQueryInfoInput>
>({ value: true });

export type McpToolGetQueryInfoOutput = {
  chart?: QueryInfoChart;
  dashboard?: QueryInfoDashboard;
  report?: QueryInfoReport;
};

export let zMcpToolGetQueryInfoOutput = z
  .object({
    chart: zQueryInfoChart.nullish(),
    dashboard: zQueryInfoDashboard.nullish(),
    report: zQueryInfoReport.nullish()
  })
  .meta({ id: 'McpToolGetQueryInfoOutput' });

assertTypesEqual<
  McpToolGetQueryInfoOutput,
  z.infer<typeof zMcpToolGetQueryInfoOutput>
>({ value: true });
