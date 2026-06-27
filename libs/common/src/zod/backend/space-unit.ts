import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';

export let zSpaceUnit = z
  .object({
    type: z.literal('spaceUnit'),
    id: z.string(),
    unitId: z.string(),
    title: z.string(),
    filePath: z.string().nullish(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(z.string()),
    author: z.string().nullish(),
    canEditOrDeleteUnit: z.boolean(),
    isFavorite: z.boolean(),
    spaceFullTitle: z.string(),
    displayAccessRoles: z.array(
      z.object({
        role: z.string(),
        isDirect: z.boolean()
      })
    ),
    modelId: z.string().nullish(),
    modelLabel: z.string().nullish(),
    chartType: z.enum(ChartTypeEnum).nullish(),
    iconPath: z.string().nullish()
  })
  .meta({ id: 'SpaceUnit' });

export type SpaceUnit = z.infer<typeof zSpaceUnit>;
