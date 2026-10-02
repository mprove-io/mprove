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
