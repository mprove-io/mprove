import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetExplorerChartTabRequest = {
  operation: 'getExplorerChartTab';
  traceId: string;
  idempotencyKey: string;
  input: {
    sessionId: string;
    chartId: string;
  };
};

export let zToBackendGetExplorerChartTabRequest = z
  .strictObject({
    operation: z.literal('getExplorerChartTab'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        sessionId: z.string(),
        chartId: z.string()
      })
      .meta({ id: 'ToBackendGetExplorerChartTabInput' })
  })
  .meta({ id: 'ToBackendGetExplorerChartTabRequest' });

assertTypesEqual<
  ToBackendGetExplorerChartTabRequest,
  z.infer<typeof zToBackendGetExplorerChartTabRequest>
>({ value: true });
