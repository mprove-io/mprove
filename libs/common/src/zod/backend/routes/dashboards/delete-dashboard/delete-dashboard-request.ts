import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteDashboardInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  dashboardId: string;
};

export type ToBackendDeleteDashboardRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteDashboardInput;
};

export let zToBackendDeleteDashboardInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    dashboardId: z.string()
  })
  .meta({ id: 'ToBackendDeleteDashboardInput' });

export let zToBackendDeleteDashboardRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteDashboardInput
  })
  .meta({ id: 'ToBackendDeleteDashboardRequest' });

assertTypesEqual<
  ToBackendDeleteDashboardInput,
  z.infer<typeof zToBackendDeleteDashboardInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteDashboardRequest,
  z.infer<typeof zToBackendDeleteDashboardRequest>
>({ value: true });
