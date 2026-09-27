import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteChartInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  chartId: string;
};

export type ToBackendDeleteChartRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteChartInput;
};

export let zToBackendDeleteChartInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    chartId: z.string()
  })
  .meta({ id: 'ToBackendDeleteChartInput' });

export let zToBackendDeleteChartRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteChartInput
  })
  .meta({ id: 'ToBackendDeleteChartRequest' });

assertTypesEqual<
  ToBackendDeleteChartInput,
  z.infer<typeof zToBackendDeleteChartInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteChartRequest,
  z.infer<typeof zToBackendDeleteChartRequest>
>({ value: true });
