import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetDashboardsOutput,
  zToBackendGetDashboardsOutput
} from '#common/types/backend/routes/dashboards/get-dashboards/get-dashboards-output';
import {
  type ToBackendGetDashboardsError,
  zToBackendGetDashboardsError
} from './get-dashboards-error';

export type ToBackendGetDashboardsResponse = ToBackendResponseBase<
  'getDashboards',
  ToBackendGetDashboardsOutput,
  ToBackendGetDashboardsError
>;

export let zToBackendGetDashboardsResponse = makeToBackendResponseSchema({
  operation: 'getDashboards',
  output: zToBackendGetDashboardsOutput,
  error: zToBackendGetDashboardsError
}).meta({ id: 'ToBackendGetDashboardsResponse' });

assertTypesEqual<
  ToBackendGetDashboardsResponse,
  z.infer<typeof zToBackendGetDashboardsResponse>
>({ value: true });
