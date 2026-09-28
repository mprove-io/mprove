import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendProduceExplorerChartRequest = {
  operation: 'produceExplorerChart';
  traceId: string;
  idempotencyKey: string;
  input: {
    sessionId: string;
    modelId: string;
    chartYaml: string;
    title: string;
  };
};

export let zToBackendProduceExplorerChartRequest = z
  .strictObject({
    operation: z.literal('produceExplorerChart'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        sessionId: z.string(),
        modelId: z.string(),
        chartYaml: z.string(),
        title: z.string()
      })
      .meta({ id: 'ToBackendProduceExplorerChartInput' })
  })
  .meta({ id: 'ToBackendProduceExplorerChartRequest' });

assertTypesEqual<
  ToBackendProduceExplorerChartRequest,
  z.infer<typeof zToBackendProduceExplorerChartRequest>
>({ value: true });
