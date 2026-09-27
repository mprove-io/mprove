import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type RunChart, zRunChart } from '#common/zod/backend/run/run-chart';
import {
  type RunDashboard,
  zRunDashboard
} from '#common/zod/backend/run/run-dashboard';
import { type RunReport, zRunReport } from '#common/zod/backend/run/run-report';
import {
  type McliQueriesStats,
  zMcliQueriesStats
} from '#common/zod/mcli/mcli-queries-stats';
import { type ToBackendRunError, zToBackendRunError } from './run-error';

export type ToBackendRunOutput = {
  charts: RunChart[];
  dashboards: RunDashboard[];
  errorCharts: RunChart[];
  errorDashboards: RunDashboard[];
  reports: RunReport[];
  errorReports: RunReport[];
  queriesStats: McliQueriesStats;
};

export type ToBackendRunResponse = ToBackendResponse<
  ToBackendRunOutput,
  ToBackendRunError
>;

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

export let zToBackendRunResponse = makeToBackendResponseSchema({
  success: zToBackendRunOutput,
  error: zToBackendRunError
}).meta({ id: 'ToBackendRunResponse' });

assertTypesEqual<ToBackendRunOutput, z.infer<typeof zToBackendRunOutput>>({
  value: true
});

assertTypesEqual<ToBackendRunResponse, z.infer<typeof zToBackendRunResponse>>({
  value: true
});
