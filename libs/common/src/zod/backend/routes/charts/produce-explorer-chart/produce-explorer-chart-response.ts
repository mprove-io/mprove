import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type BmlError, zBmlError } from '#common/zod/blockml/bml-error';
import {
  type ToBackendProduceExplorerChartError,
  zToBackendProduceExplorerChartError
} from './produce-explorer-chart-error';

export type ToBackendProduceExplorerChartOutput =
  | {
      status: 'ok';
      tabId: string;
      chartId: string;
      title: string;
    }
  | {
      status: 'error';
      errors: BmlError[];
    };

export type ToBackendProduceExplorerChartResponse = ToBackendResponse<
  ToBackendProduceExplorerChartOutput,
  ToBackendProduceExplorerChartError
>;

export let zToBackendProduceExplorerChartOutput = z
  .discriminatedUnion('status', [
    z.object({
      status: z.literal('ok'),
      tabId: z.string(),
      chartId: z.string(),
      title: z.string()
    }),
    z.object({
      status: z.literal('error'),
      errors: z.array(zBmlError)
    })
  ])
  .meta({ id: 'ToBackendProduceExplorerChartOutput' });

export let zToBackendProduceExplorerChartResponse = makeToBackendResponseSchema(
  {
    success: zToBackendProduceExplorerChartOutput,
    error: zToBackendProduceExplorerChartError
  }
).meta({ id: 'ToBackendProduceExplorerChartResponse' });

assertTypesEqual<
  ToBackendProduceExplorerChartOutput,
  z.infer<typeof zToBackendProduceExplorerChartOutput>
>({ value: true });

assertTypesEqual<
  ToBackendProduceExplorerChartResponse,
  z.infer<typeof zToBackendProduceExplorerChartResponse>
>({ value: true });
