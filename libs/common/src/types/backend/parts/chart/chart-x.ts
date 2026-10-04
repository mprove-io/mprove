import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type TileX, zTileX } from '#common/types/backend/parts/tile/tile-x';
import { type Chart, zChart } from '#common/types/blockml/parts/chart/chart';
import {
  type ChartType,
  zChartType
} from '#common/types/blockml/parts/chart/chart-type';

import type { Extend } from '#common/types/extend';

export type ChartX = Extend<
  Chart,
  {
    tiles: TileX[];
    author: string;
    canEditOrDeleteChart: boolean;
    chartType: ChartType;
    iconPath?: string;
  }
>;

export let zChartX = zChart
  .extend({
    tiles: z.array(zTileX),
    author: z.string(),
    canEditOrDeleteChart: z.boolean(),
    chartType: zChartType,
    iconPath: z.string().nullish()
  })
  .meta({ id: 'ChartX' });

assertTypesEqual<ChartX, z.infer<typeof zChartX>>({ value: true });
