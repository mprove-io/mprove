import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { zTimezone } from '#common/types/z-timezone';

export type ToBackendGetChartRequest = {
  operation: 'getChart';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    chartId: string;
    timezone: string;
  };
};

export let zToBackendGetChartRequest = z
  .strictObject({
    operation: z.literal('getChart'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        chartId: z.string(),
        timezone: zTimezone
      })
      .meta({ id: 'ToBackendGetChartInput' })
  })
  .meta({ id: 'ToBackendGetChartRequest' });

assertTypesEqual<
  ToBackendGetChartRequest,
  z.infer<typeof zToBackendGetChartRequest>
>({ value: true });
