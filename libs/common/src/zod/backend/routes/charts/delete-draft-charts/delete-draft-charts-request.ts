import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteDraftChartsRequest = {
  operation: 'deleteDraftCharts';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    chartIds: string[];
  };
};

export let zToBackendDeleteDraftChartsRequest = z
  .strictObject({
    operation: z.literal('deleteDraftCharts'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        chartIds: z.array(z.string())
      })
      .meta({ id: 'ToBackendDeleteDraftChartsInput' })
  })
  .meta({ id: 'ToBackendDeleteDraftChartsRequest' });

assertTypesEqual<
  ToBackendDeleteDraftChartsRequest,
  z.infer<typeof zToBackendDeleteDraftChartsRequest>
>({ value: true });
