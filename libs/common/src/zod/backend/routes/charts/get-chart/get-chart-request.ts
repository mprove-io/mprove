import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { zTimezone } from '#common/zod/z-timezone';

export type ToBackendGetChartInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  chartId: string;
  timezone: string;
};

export type ToBackendGetChartRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetChartInput;
};

export let zToBackendGetChartInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    chartId: z.string(),
    timezone: zTimezone
  })
  .meta({ id: 'ToBackendGetChartInput' });

export let zToBackendGetChartRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetChartInput
  })
  .meta({ id: 'ToBackendGetChartRequest' });

assertTypesEqual<
  ToBackendGetChartInput,
  z.infer<typeof zToBackendGetChartInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetChartRequest,
  z.infer<typeof zToBackendGetChartRequest>
>({ value: true });
