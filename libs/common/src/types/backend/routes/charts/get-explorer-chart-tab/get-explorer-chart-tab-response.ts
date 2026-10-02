import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetExplorerChartTabOutput,
  zToBackendGetExplorerChartTabOutput
} from '#common/types/backend/routes/charts/get-explorer-chart-tab/get-explorer-chart-tab-output';
import {
  type ToBackendGetExplorerChartTabError,
  zToBackendGetExplorerChartTabError
} from './get-explorer-chart-tab-error';

export type ToBackendGetExplorerChartTabResponse = ToBackendResponseBase<
  'getExplorerChartTab',
  ToBackendGetExplorerChartTabOutput,
  ToBackendGetExplorerChartTabError
>;

export let zToBackendGetExplorerChartTabResponse = makeToBackendResponseSchema({
  operation: 'getExplorerChartTab',
  output: zToBackendGetExplorerChartTabOutput,
  error: zToBackendGetExplorerChartTabError
}).meta({ id: 'ToBackendGetExplorerChartTabResponse' });

assertTypesEqual<
  ToBackendGetExplorerChartTabResponse,
  z.infer<typeof zToBackendGetExplorerChartTabResponse>
>({ value: true });
