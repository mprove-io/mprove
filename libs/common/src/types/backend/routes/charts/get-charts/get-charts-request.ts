import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetChartsRequest = {
  operation: 'getCharts';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  };
};

export let zToBackendGetChartsRequest = z
  .strictObject({
    operation: z.literal('getCharts'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string()
      })
      .meta({ id: 'ToBackendGetChartsInput' })
  })
  .meta({ id: 'ToBackendGetChartsRequest' });

assertTypesEqual<
  ToBackendGetChartsRequest,
  z.infer<typeof zToBackendGetChartsRequest>
>({ value: true });
