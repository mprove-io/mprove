import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteChartRequest = {
  operation: 'deleteChart';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    chartId: string;
  };
};

export let zToBackendDeleteChartRequest = z
  .strictObject({
    operation: z.literal('deleteChart'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        chartId: z.string()
      })
      .meta({ id: 'ToBackendDeleteChartInput' })
  })
  .meta({ id: 'ToBackendDeleteChartRequest' });

assertTypesEqual<
  ToBackendDeleteChartRequest,
  z.infer<typeof zToBackendDeleteChartRequest>
>({ value: true });
