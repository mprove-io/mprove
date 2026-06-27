import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { zAccessRoleCombined } from '#common/zod/access-role-combined';

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
    chartType: z.enum(ChartTypeEnum).nullish(),
    iconPath: z.string().nullish()
  })
  .meta({ id: 'SpaceUnit' });

export type SpaceUnit = z.infer<typeof zSpaceUnit>;
