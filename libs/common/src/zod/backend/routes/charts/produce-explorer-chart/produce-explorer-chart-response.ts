import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendProduceExplorerChartOutput,
  zToBackendProduceExplorerChartOutput
} from '#common/zod/backend/routes/charts/produce-explorer-chart/produce-explorer-chart-output';
import {
  type ToBackendProduceExplorerChartError,
  zToBackendProduceExplorerChartError
} from './produce-explorer-chart-error';

export type ToBackendProduceExplorerChartResponse = ToBackendResponseBase<
  'produceExplorerChart',
  ToBackendProduceExplorerChartOutput,
  ToBackendProduceExplorerChartError
>;

export let zToBackendProduceExplorerChartResponse = makeToBackendResponseSchema(
  {
    operation: 'produceExplorerChart',
    output: zToBackendProduceExplorerChartOutput,
    error: zToBackendProduceExplorerChartError
  }
).meta({ id: 'ToBackendProduceExplorerChartResponse' });

assertTypesEqual<
  ToBackendProduceExplorerChartResponse,
  z.infer<typeof zToBackendProduceExplorerChartResponse>
>({ value: true });
