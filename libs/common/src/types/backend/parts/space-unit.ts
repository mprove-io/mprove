import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ChartType,
  zChartType
} from '#common/types/blockml/parts/chart/chart-type';

import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type SpaceUnit = {
  type: 'spaceUnit';
  id: string;
  unitId: string;
  title: string;
  filePath?: string;
  space?: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  author?: string;
  canEditOrDeleteUnit: boolean;
  isFavorite: boolean;
  spaceFullTitle: string;
  modelId?: string;
  modelLabel?: string;
  chartType?: ChartType;
  iconPath?: string;
};

export let zSpaceUnit = z
  .object({
    type: z.literal('spaceUnit'),
    id: z.string(),
    unitId: z.string(),
    title: z.string(),
    filePath: z.string().nullish(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    author: z.string().nullish(),
    canEditOrDeleteUnit: z.boolean(),
    isFavorite: z.boolean(),
    spaceFullTitle: z.string(),
    modelId: z.string().nullish(),
    modelLabel: z.string().nullish(),
    chartType: zChartType.nullish(),
    iconPath: z.string().nullish()
  })
  .meta({ id: 'SpaceUnit' });

assertTypesEqual<SpaceUnit, z.infer<typeof zSpaceUnit>>({ value: true });
