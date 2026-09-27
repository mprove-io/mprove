import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardField,
  zDashboardField
} from '#common/zod/blockml/dashboard-field';
import { type Tile, zTile } from '#common/zod/blockml/tile';

export type ToBackendEditDraftDashboardInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  oldDashboardId: string;
  newDashboardId: string;
  newDashboardFields: DashboardField[];
  tiles: Tile[];
  timezone: string;
};

export type ToBackendEditDraftDashboardRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendEditDraftDashboardInput;
};

export let zToBackendEditDraftDashboardInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    oldDashboardId: z.string(),
    newDashboardId: z.string(),
    newDashboardFields: z.array(zDashboardField),
    tiles: z.array(zTile),
    timezone: z.string()
  })
  .meta({ id: 'ToBackendEditDraftDashboardInput' });

export let zToBackendEditDraftDashboardRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendEditDraftDashboardInput
  })
  .meta({ id: 'ToBackendEditDraftDashboardRequest' });

assertTypesEqual<
  ToBackendEditDraftDashboardInput,
  z.infer<typeof zToBackendEditDraftDashboardInput>
>({ value: true });

assertTypesEqual<
  ToBackendEditDraftDashboardRequest,
  z.infer<typeof zToBackendEditDraftDashboardRequest>
>({ value: true });
