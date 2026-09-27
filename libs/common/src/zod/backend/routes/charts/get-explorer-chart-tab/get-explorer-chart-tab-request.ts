import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetExplorerChartTabInput = {
  sessionId: string;
  chartId: string;
};

export type ToBackendGetExplorerChartTabRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetExplorerChartTabInput;
};

export let zToBackendGetExplorerChartTabInput = z
  .object({
    sessionId: z.string(),
    chartId: z.string()
  })
  .meta({ id: 'ToBackendGetExplorerChartTabInput' });

export let zToBackendGetExplorerChartTabRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetExplorerChartTabInput
  })
  .meta({ id: 'ToBackendGetExplorerChartTabRequest' });

assertTypesEqual<
  ToBackendGetExplorerChartTabInput,
  z.infer<typeof zToBackendGetExplorerChartTabInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetExplorerChartTabRequest,
  z.infer<typeof zToBackendGetExplorerChartTabRequest>
>({ value: true });
