import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteDraftDashboardsInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  dashboardIds: string[];
};

export type ToBackendDeleteDraftDashboardsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteDraftDashboardsInput;
};

export let zToBackendDeleteDraftDashboardsInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    dashboardIds: z.array(z.string())
  })
  .meta({ id: 'ToBackendDeleteDraftDashboardsInput' });

export let zToBackendDeleteDraftDashboardsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteDraftDashboardsInput
  })
  .meta({ id: 'ToBackendDeleteDraftDashboardsRequest' });

assertTypesEqual<
  ToBackendDeleteDraftDashboardsInput,
  z.infer<typeof zToBackendDeleteDraftDashboardsInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteDraftDashboardsRequest,
  z.infer<typeof zToBackendDeleteDraftDashboardsRequest>
>({ value: true });
