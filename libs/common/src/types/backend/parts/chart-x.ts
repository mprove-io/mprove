import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type TileX, zTileX } from '#common/types/backend/parts/tile-x';
import { type Chart, zChart } from '#common/types/blockml/parts/chart';
import type { EnumValues } from '#common/types/enum-values';
import type { Extend } from '#common/types/extend';

export type ChartX = Extend<
  Chart,
  {
    tiles: TileX[];
    author: string;
    canEditOrDeleteChart: boolean;
    chartType: EnumValues<typeof ChartTypeEnum>;
    iconPath?: string;
  }
>;

export let zChartX = zChart
  .extend({
    tiles: z.array(zTileX),
    author: z.string(),
    canEditOrDeleteChart: z.boolean(),
    chartType: z.enum(ChartTypeEnum),
    iconPath: z.string().nullish()
  })
  .meta({ id: 'ChartX' });

assertTypesEqual<ChartX, z.infer<typeof zChartX>>({ value: true });
