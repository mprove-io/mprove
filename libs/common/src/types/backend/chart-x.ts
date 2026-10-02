import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { zTileX } from '#common/types/backend/tile-x';
import { zChart } from '#common/types/blockml/chart';

export let zChartX = zChart
  .extend({
    tiles: z.array(zTileX),
    author: z.string(),
    canEditOrDeleteChart: z.boolean(),
    chartType: z.enum(ChartTypeEnum),
    iconPath: z.string().nullish()
  })
  .meta({ id: 'ChartX' });

export type ChartX = z.infer<typeof zChartX>;
