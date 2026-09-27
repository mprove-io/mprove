import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCheckLastNavInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  modelId?: string;
  chartId?: string;
  dashboardId?: string;
  reportId?: string;
};

export type ToBackendCheckLastNavRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCheckLastNavInput;
};

export let zToBackendCheckLastNavInput = z
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
  .meta({ id: 'ToBackendCheckLastNavInput' });

export let zToBackendCheckLastNavRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCheckLastNavInput
  })
  .meta({ id: 'ToBackendCheckLastNavRequest' });

assertTypesEqual<
  ToBackendCheckLastNavInput,
  z.infer<typeof zToBackendCheckLastNavInput>
>({ value: true });

assertTypesEqual<
  ToBackendCheckLastNavRequest,
  z.infer<typeof zToBackendCheckLastNavRequest>
>({ value: true });
