import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RunTile,
  zRunTile
} from '#common/types/backend/parts/run/run-tile';

export type RunDashboard = {
  title: string;
  dashboardId: string;
  url: string;
  tiles: RunTile[];
};

export let zRunDashboard = z
  .object({
    title: z.string(),
    dashboardId: z.string(),
    url: z.string(),
    tiles: z.array(zRunTile)
  })
  .meta({ id: 'RunDashboard' });

assertTypesEqual<RunDashboard, z.infer<typeof zRunDashboard>>({ value: true });
