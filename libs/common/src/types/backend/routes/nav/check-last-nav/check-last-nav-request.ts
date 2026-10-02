import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCheckLastNavRequest = {
  operation: 'checkLastNav';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    modelId?: string;
    chartId?: string;
    dashboardId?: string;
    reportId?: string;
  };
};

export let zToBackendCheckLastNavRequest = z
  .strictObject({
    operation: z.literal('checkLastNav'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        modelId: z.string().nullish(),
        chartId: z.string().nullish(),
        dashboardId: z.string().nullish(),
        reportId: z.string().nullish()
      })
      .meta({ id: 'ToBackendCheckLastNavInput' })
  })
  .meta({ id: 'ToBackendCheckLastNavRequest' });

assertTypesEqual<
  ToBackendCheckLastNavRequest,
  z.infer<typeof zToBackendCheckLastNavRequest>
>({ value: true });
