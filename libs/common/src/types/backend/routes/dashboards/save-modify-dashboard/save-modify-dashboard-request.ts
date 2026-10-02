import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type TileX, zTileX } from '#common/types/backend/parts/tile-x';

export type ToBackendSaveModifyDashboardRequest = {
  operation: 'saveModifyDashboard';
  traceId: string;
  idempotencyKey: string;
  input: {
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
};

export let zToBackendSaveModifyDashboardRequest = z
  .strictObject({
    operation: z.literal('saveModifyDashboard'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
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
      .meta({ id: 'ToBackendSaveModifyDashboardInput' })
  })
  .meta({ id: 'ToBackendSaveModifyDashboardRequest' });

assertTypesEqual<
  ToBackendSaveModifyDashboardRequest,
  z.infer<typeof zToBackendSaveModifyDashboardRequest>
>({ value: true });
