import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RunChart,
  zRunChart
} from '#common/types/backend/parts/run/run-chart';
import {
  type RunDashboard,
  zRunDashboard
} from '#common/types/backend/parts/run/run-dashboard';
import {
  type RunQueriesStats,
  zRunQueriesStats
} from '#common/types/backend/parts/run/run-queries-stats';
import {
  type RunReport,
  zRunReport
} from '#common/types/backend/parts/run/run-report';

export type McpToolRunOutput = {
  charts: RunChart[];
  dashboards: RunDashboard[];
  reports: RunReport[];
  errorCharts: RunChart[];
  errorDashboards: RunDashboard[];
  errorReports: RunReport[];
  queriesStats: RunQueriesStats;
};

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

assertTypesEqual<McpToolRunOutput, z.infer<typeof zMcpToolRunOutput>>({
  value: true
});
