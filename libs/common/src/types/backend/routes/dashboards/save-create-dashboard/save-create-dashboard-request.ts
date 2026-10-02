import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type TileX, zTileX } from '#common/types/backend/tile-x';

export type ToBackendSaveCreateDashboardRequest = {
  operation: 'saveCreateDashboard';
  traceId: string;
  idempotencyKey: string;
  input: {
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
};

export let zToBackendSaveCreateDashboardRequest = z
  .strictObject({
    operation: z.literal('saveCreateDashboard'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
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
      .meta({ id: 'ToBackendSaveCreateDashboardInput' })
  })
  .meta({ id: 'ToBackendSaveCreateDashboardRequest' });

assertTypesEqual<
  ToBackendSaveCreateDashboardRequest,
  z.infer<typeof zToBackendSaveCreateDashboardRequest>
>({ value: true });
