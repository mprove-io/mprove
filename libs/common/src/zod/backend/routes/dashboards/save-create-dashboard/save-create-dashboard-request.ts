import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type TileX, zTileX } from '#common/zod/backend/tile-x';

export type ToBackendSaveCreateDashboardInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  fromDashboardId?: string;
  newDashboardId: string;
  dashboardTitle?: string;
  space?: string;
  accessRoles?: string[];
  tilesGrid?: TileX[];
  timezone: string;
};

export type ToBackendSaveCreateDashboardRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSaveCreateDashboardInput;
};

export let zToBackendSaveCreateDashboardInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fromDashboardId: z.string().nullish(),
    newDashboardId: z.string(),
    dashboardTitle: z.string().nullish(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()).nullish(),
    tilesGrid: z.array(zTileX).nullish(),
    timezone: z.string()
  })
  .meta({ id: 'ToBackendSaveCreateDashboardInput' });

export let zToBackendSaveCreateDashboardRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSaveCreateDashboardInput
  })
  .meta({ id: 'ToBackendSaveCreateDashboardRequest' });

assertTypesEqual<
  ToBackendSaveCreateDashboardInput,
  z.infer<typeof zToBackendSaveCreateDashboardInput>
>({ value: true });

assertTypesEqual<
  ToBackendSaveCreateDashboardRequest,
  z.infer<typeof zToBackendSaveCreateDashboardRequest>
>({ value: true });
