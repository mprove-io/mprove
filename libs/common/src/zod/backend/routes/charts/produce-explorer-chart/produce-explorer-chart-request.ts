import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendProduceExplorerChartInput = {
  sessionId: string;
  modelId: string;
  chartYaml: string;
  title: string;
};

export type ToBackendProduceExplorerChartRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendProduceExplorerChartInput;
};

export let zToBackendProduceExplorerChartInput = z
  .object({
    sessionId: z.string(),
    modelId: z.string(),
    chartYaml: z.string(),
    title: z.string()
  })
  .meta({ id: 'ToBackendProduceExplorerChartInput' });

export let zToBackendProduceExplorerChartRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendProduceExplorerChartInput
  })
  .meta({ id: 'ToBackendProduceExplorerChartRequest' });

assertTypesEqual<
  ToBackendProduceExplorerChartInput,
  z.infer<typeof zToBackendProduceExplorerChartInput>
>({ value: true });

assertTypesEqual<
  ToBackendProduceExplorerChartRequest,
  z.infer<typeof zToBackendProduceExplorerChartRequest>
>({ value: true });
