import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Tile, zTile } from '#common/types/blockml/parts/tile/tile';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type Chart = {
  structId: string;
  chartId: string;
  draft: boolean;
  isExplorer?: boolean;
  sessionId?: string;
  chartYaml?: string;
  creatorId: string;
  title: string;
  modelId: string;
  modelLabel: string;
  filePath: string;
  space?: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  tiles: Tile[];
  serverTs: number;
};

export let zChart = z
  .object({
    structId: z.string(),
    chartId: z.string(),
    draft: z.boolean(),
    isExplorer: z.boolean().nullish(),
    sessionId: z.string().nullish(),
    chartYaml: z.string().nullish(),
    creatorId: z.string(),
    title: z.string(),
    modelId: z.string(),
    modelLabel: z.string(),
    filePath: z.string(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    tiles: z.array(zTile),
    serverTs: z.number().int()
  })
  .meta({ id: 'Chart' });

assertTypesEqual<Chart, z.infer<typeof zChart>>({ value: true });
