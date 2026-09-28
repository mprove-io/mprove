import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteDraftDashboardsOutput,
  zToBackendDeleteDraftDashboardsOutput
} from '#common/zod/backend/routes/dashboards/delete-draft-dashboards/delete-draft-dashboards-output';
import {
  type ToBackendDeleteDraftDashboardsError,
  zToBackendDeleteDraftDashboardsError
} from './delete-draft-dashboards-error';

export type ToBackendDeleteDraftDashboardsResponse = ToBackendResponseBase<
  'deleteDraftDashboards',
  ToBackendDeleteDraftDashboardsOutput,
  ToBackendDeleteDraftDashboardsError
>;

export let zToBackendDeleteDraftDashboardsResponse =
  makeToBackendResponseSchema({
    operation: 'deleteDraftDashboards',
    output: zToBackendDeleteDraftDashboardsOutput,
    error: zToBackendDeleteDraftDashboardsError
  }).meta({ id: 'ToBackendDeleteDraftDashboardsResponse' });

assertTypesEqual<
  ToBackendDeleteDraftDashboardsResponse,
  z.infer<typeof zToBackendDeleteDraftDashboardsResponse>
>({ value: true });
