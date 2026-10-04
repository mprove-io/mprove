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

export type ChartUnit = {
  type: 'chartUnit';
  id: string;
  chartId: string;
  modelId: string;
  modelLabel: string;
  chartType: ChartType;
  iconPath?: string;
  draft: boolean;
  title: string;
  filePath?: string;
  space?: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  author?: string;
  canEditOrDeleteChart: boolean;
  isFavorite: boolean;
  spaceFullTitle: string;
};

export let zChartUnit = z
  .object({
    type: z.literal('chartUnit'),
    id: z.string(),
    chartId: z.string(),
    modelId: z.string(),
    modelLabel: z.string(),
    chartType: zChartType,
    iconPath: z.string().nullish(),
    draft: z.boolean(),
    title: z.string(),
    filePath: z.string().nullish(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    author: z.string().nullish(),
    canEditOrDeleteChart: z.boolean(),
    isFavorite: z.boolean(),
    spaceFullTitle: z.string()
  })
  .meta({ id: 'ChartUnit' });

assertTypesEqual<ChartUnit, z.infer<typeof zChartUnit>>({ value: true });
