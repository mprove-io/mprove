import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendEditDraftChartOutput,
  zToBackendEditDraftChartOutput
} from '#common/zod/backend/routes/charts/edit-draft-chart/edit-draft-chart-output';
import {
  type ToBackendEditDraftChartError,
  zToBackendEditDraftChartError
} from './edit-draft-chart-error';

export type ToBackendEditDraftChartResponse = ToBackendResponseBase<
  'editDraftChart',
  ToBackendEditDraftChartOutput,
  ToBackendEditDraftChartError
>;

export let zToBackendEditDraftChartResponse = makeToBackendResponseSchema({
  operation: 'editDraftChart',
  output: zToBackendEditDraftChartOutput,
  error: zToBackendEditDraftChartError
}).meta({ id: 'ToBackendEditDraftChartResponse' });

assertTypesEqual<
  ToBackendEditDraftChartResponse,
  z.infer<typeof zToBackendEditDraftChartResponse>
>({ value: true });
