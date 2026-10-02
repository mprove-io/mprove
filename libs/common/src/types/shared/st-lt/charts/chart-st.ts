import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Tile, zTile } from '#common/types/blockml/parts/tile';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type ChartSt = {
  title: string;
  modelLabel: string;
  filePath: string;
  space?: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  tiles: Tile[];
};

export let zChartSt = z
  .object({
    title: z.string(),
    modelLabel: z.string(),
    filePath: z.string(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    tiles: z.array(zTile)
  })
  .meta({ id: 'ChartSt' });

assertTypesEqual<ChartSt, z.infer<typeof zChartSt>>({ value: true });
