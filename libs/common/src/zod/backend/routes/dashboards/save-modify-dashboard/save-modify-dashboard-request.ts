import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type TileX, zTileX } from '#common/zod/backend/tile-x';

export type ToBackendSaveModifyDashboardInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  toDashboardId: string;
  fromDashboardId: string;
  newTile?: TileX;
  isReplaceTile?: boolean;
  selectedTileTitle?: string;
  dashboardTitle?: string;
  space?: string;
  accessRoles?: string[];
  tilesGrid?: TileX[];
  timezone: string;
};

export type ToBackendSaveModifyDashboardRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSaveModifyDashboardInput;
};

export let zToBackendSaveModifyDashboardInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    toDashboardId: z.string(),
    fromDashboardId: z.string(),
    newTile: zTileX.nullish(),
    isReplaceTile: z.boolean().nullish(),
    selectedTileTitle: z.string().nullish(),
    dashboardTitle: z.string().nullish(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()).nullish(),
    tilesGrid: z.array(zTileX).nullish(),
    timezone: z.string()
  })
  .meta({ id: 'ToBackendSaveModifyDashboardInput' });

export let zToBackendSaveModifyDashboardRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSaveModifyDashboardInput
  })
  .meta({ id: 'ToBackendSaveModifyDashboardRequest' });

assertTypesEqual<
  ToBackendSaveModifyDashboardInput,
  z.infer<typeof zToBackendSaveModifyDashboardInput>
>({ value: true });

assertTypesEqual<
  ToBackendSaveModifyDashboardRequest,
  z.infer<typeof zToBackendSaveModifyDashboardRequest>
>({ value: true });
