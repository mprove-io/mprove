import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCreateDraftChartOutput,
  zToBackendCreateDraftChartOutput
} from '#common/types/backend/routes/charts/create-draft-chart/create-draft-chart-output';
import {
  type ToBackendCreateDraftChartError,
  zToBackendCreateDraftChartError
} from './create-draft-chart-error';

export type ToBackendCreateDraftChartResponse = ToBackendResponseBase<
  'createDraftChart',
  ToBackendCreateDraftChartOutput,
  ToBackendCreateDraftChartError
>;

export let zToBackendCreateDraftChartResponse = makeToBackendResponseSchema({
  operation: 'createDraftChart',
  output: zToBackendCreateDraftChartOutput,
  error: zToBackendCreateDraftChartError
}).meta({ id: 'ToBackendCreateDraftChartResponse' });

assertTypesEqual<
  ToBackendCreateDraftChartResponse,
  z.infer<typeof zToBackendCreateDraftChartResponse>
>({ value: true });
