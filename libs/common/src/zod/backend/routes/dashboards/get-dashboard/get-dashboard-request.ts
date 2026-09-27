import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { zTimezone } from '#common/zod/z-timezone';

export type ToBackendGetDashboardInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  dashboardId: string;
  timezone: string;
};

export type ToBackendGetDashboardRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetDashboardInput;
};

export let zToBackendGetDashboardInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    dashboardId: z.string(),
    timezone: zTimezone
  })
  .meta({ id: 'ToBackendGetDashboardInput' });

export let zToBackendGetDashboardRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetDashboardInput
  })
  .meta({ id: 'ToBackendGetDashboardRequest' });

assertTypesEqual<
  ToBackendGetDashboardInput,
  z.infer<typeof zToBackendGetDashboardInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetDashboardRequest,
  z.infer<typeof zToBackendGetDashboardRequest>
>({ value: true });
