import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardField,
  zDashboardField
} from '#common/zod/blockml/dashboard-field';
import { type Tile, zTile } from '#common/zod/blockml/tile';

export type ToBackendCreateDraftDashboardInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  oldDashboardId: string;
  newDashboardId: string;
  newDashboardFields: DashboardField[];
  tiles: Tile[];
  timezone: string;
  isQueryCache: boolean;
  cachedQueryMconfigIds: string[];
};

export type ToBackendCreateDraftDashboardRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateDraftDashboardInput;
};

export let zToBackendCreateDraftDashboardInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    oldDashboardId: z.string(),
    newDashboardId: z.string(),
    newDashboardFields: z.array(zDashboardField),
    tiles: z.array(zTile),
    timezone: z.string(),
    isQueryCache: z.boolean(),
    cachedQueryMconfigIds: z.array(z.string())
  })
  .meta({ id: 'ToBackendCreateDraftDashboardInput' });

export let zToBackendCreateDraftDashboardRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateDraftDashboardInput
  })
  .meta({ id: 'ToBackendCreateDraftDashboardRequest' });

assertTypesEqual<
  ToBackendCreateDraftDashboardInput,
  z.infer<typeof zToBackendCreateDraftDashboardInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateDraftDashboardRequest,
  z.infer<typeof zToBackendCreateDraftDashboardRequest>
>({ value: true });
