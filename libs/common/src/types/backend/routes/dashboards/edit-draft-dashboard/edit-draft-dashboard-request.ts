import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardField,
  zDashboardField
} from '#common/types/blockml/parts/dashboard-field';
import { type Tile, zTile } from '#common/types/blockml/parts/tile';

export type ToBackendEditDraftDashboardRequest = {
  operation: 'editDraftDashboard';
  traceId: string;
  idempotencyKey: string;
  input: {
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
};

export let zToBackendEditDraftDashboardRequest = z
  .strictObject({
    operation: z.literal('editDraftDashboard'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
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
      .meta({ id: 'ToBackendEditDraftDashboardInput' })
  })
  .meta({ id: 'ToBackendEditDraftDashboardRequest' });

assertTypesEqual<
  ToBackendEditDraftDashboardRequest,
  z.infer<typeof zToBackendEditDraftDashboardRequest>
>({ value: true });
