import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type QueryInfoChart,
  zQueryInfoChart
} from '#common/zod/backend/query-info/query-info-chart';
import {
  type QueryInfoDashboard,
  zQueryInfoDashboard
} from '#common/zod/backend/query-info/query-info-dashboard';
import {
  type QueryInfoReport,
  zQueryInfoReport
} from '#common/zod/backend/query-info/query-info-report';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetQueryInfoError,
  zToBackendGetQueryInfoError
} from './get-query-info-error';

export type ToBackendGetQueryInfoOutput = {
  chart?: QueryInfoChart;
  dashboard?: QueryInfoDashboard;
  report?: QueryInfoReport;
};

export type ToBackendGetQueryInfoResponse = ToBackendResponse<
  ToBackendGetQueryInfoOutput,
  ToBackendGetQueryInfoError
>;

export let zToBackendGetQueryInfoOutput = z
  .object({
    chart: zQueryInfoChart.nullish(),
    dashboard: zQueryInfoDashboard.nullish(),
    report: zQueryInfoReport.nullish()
  })
  .meta({ id: 'ToBackendGetQueryInfoOutput' });

export let zToBackendGetQueryInfoResponse = makeToBackendResponseSchema({
  success: zToBackendGetQueryInfoOutput,
  error: zToBackendGetQueryInfoError
}).meta({ id: 'ToBackendGetQueryInfoResponse' });

assertTypesEqual<
  ToBackendGetQueryInfoOutput,
  z.infer<typeof zToBackendGetQueryInfoOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetQueryInfoResponse,
  z.infer<typeof zToBackendGetQueryInfoResponse>
>({ value: true });
