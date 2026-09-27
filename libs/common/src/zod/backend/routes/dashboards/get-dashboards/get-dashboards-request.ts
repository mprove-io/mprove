import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetDashboardsInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
};

export type ToBackendGetDashboardsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetDashboardsInput;
};

export let zToBackendGetDashboardsInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendGetDashboardsInput' });

export let zToBackendGetDashboardsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetDashboardsInput
  })
  .meta({ id: 'ToBackendGetDashboardsRequest' });

assertTypesEqual<
  ToBackendGetDashboardsInput,
  z.infer<typeof zToBackendGetDashboardsInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetDashboardsRequest,
  z.infer<typeof zToBackendGetDashboardsRequest>
>({ value: true });
