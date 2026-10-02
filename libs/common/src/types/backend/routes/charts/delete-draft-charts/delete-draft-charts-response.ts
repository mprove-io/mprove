import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteDraftChartsOutput,
  zToBackendDeleteDraftChartsOutput
} from '#common/types/backend/routes/charts/delete-draft-charts/delete-draft-charts-output';
import {
  type ToBackendDeleteDraftChartsError,
  zToBackendDeleteDraftChartsError
} from './delete-draft-charts-error';

export type ToBackendDeleteDraftChartsResponse = ToBackendResponseBase<
  'deleteDraftCharts',
  ToBackendDeleteDraftChartsOutput,
  ToBackendDeleteDraftChartsError
>;

export let zToBackendDeleteDraftChartsResponse = makeToBackendResponseSchema({
  operation: 'deleteDraftCharts',
  output: zToBackendDeleteDraftChartsOutput,
  error: zToBackendDeleteDraftChartsError
}).meta({ id: 'ToBackendDeleteDraftChartsResponse' });

assertTypesEqual<
  ToBackendDeleteDraftChartsResponse,
  z.infer<typeof zToBackendDeleteDraftChartsResponse>
>({ value: true });
