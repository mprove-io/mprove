import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BmlError,
  zBmlError
} from '#common/types/blockml/diagnostics/bml-error';

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

assertTypesEqual<
  ToBackendProduceExplorerChartOutput,
  z.infer<typeof zToBackendProduceExplorerChartOutput>
>({ value: true });
