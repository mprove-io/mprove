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
  type RunReport,
  zRunReport
} from '#common/types/backend/parts/run/run-report';
import {
  type McliQueriesStats,
  zMcliQueriesStats
} from '#common/types/mcli/mcli-queries-stats';

export type ToBackendRunOutput = {
  charts: RunChart[];
  dashboards: RunDashboard[];
  errorCharts: RunChart[];
  errorDashboards: RunDashboard[];
  reports: RunReport[];
  errorReports: RunReport[];
  queriesStats: McliQueriesStats;
};

export let zToBackendRunOutput = z
  .object({
    charts: z.array(zRunChart),
    dashboards: z.array(zRunDashboard),
    errorCharts: z.array(zRunChart),
    errorDashboards: z.array(zRunDashboard),
    reports: z.array(zRunReport),
    errorReports: z.array(zRunReport),
    queriesStats: zMcliQueriesStats
  })
  .meta({ id: 'ToBackendRunOutput' });

assertTypesEqual<ToBackendRunOutput, z.infer<typeof zToBackendRunOutput>>({
  value: true
});
