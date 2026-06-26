import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';

export let zChartUnit = z
  .object({
    type: z.literal('chartUnit'),
    id: z.string(),
    chartId: z.string(),
    modelId: z.string(),
    modelLabel: z.string(),
    chartType: z.enum(ChartTypeEnum),
    iconPath: z.string().nullish(),
    draft: z.boolean(),
    title: z.string(),
    filePath: z.string().nullish(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(z.string()),
    author: z.string().nullish(),
    canEditOrDeleteChart: z.boolean(),
    isFavorite: z.boolean(),
    displaySpace: z.string(),
    displayAccessRoles: z.array(
      z.object({
        role: z.string(),
        isDirect: z.boolean()
      })
    )
  })
  .meta({ id: 'ChartUnit' });

export type ChartUnit = z.infer<typeof zChartUnit>;
