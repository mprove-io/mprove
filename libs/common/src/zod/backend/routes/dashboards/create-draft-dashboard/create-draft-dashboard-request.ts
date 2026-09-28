import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardField,
  zDashboardField
} from '#common/zod/blockml/dashboard-field';
import { type Tile, zTile } from '#common/zod/blockml/tile';

export type ToBackendCreateDraftDashboardRequest = {
  operation: 'createDraftDashboard';
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
    isQueryCache: boolean;
    cachedQueryMconfigIds: string[];
  };
};

export let zToBackendCreateDraftDashboardRequest = z
  .strictObject({
    operation: z.literal('createDraftDashboard'),
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
        timezone: z.string(),
        isQueryCache: z.boolean(),
        cachedQueryMconfigIds: z.array(z.string())
      })
      .meta({ id: 'ToBackendCreateDraftDashboardInput' })
  })
  .meta({ id: 'ToBackendCreateDraftDashboardRequest' });

assertTypesEqual<
  ToBackendCreateDraftDashboardRequest,
  z.infer<typeof zToBackendCreateDraftDashboardRequest>
>({ value: true });
