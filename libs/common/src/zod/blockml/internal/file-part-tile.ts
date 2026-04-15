import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { zFilterBricksDictionary } from '#common/zod/blockml/filter-bricks-dictionary';
import { zFraction } from '#common/zod/blockml/fraction';
import { zFileChartData } from '#common/zod/blockml/internal/file-chart-data';
import { zFileChartOptions } from '#common/zod/blockml/internal/file-chart-options';
import { zFileChartPlate } from '#common/zod/blockml/internal/file-chart-plate';
import { zFileTileParameter } from '#common/zod/blockml/internal/file-tile-parameter';

export let zFilePartTile = z
  .object({
    title: z.string().nullish(),
    title_line_num: z.number().nullish(),
    model: z.string().nullish(),
    model_line_num: z.number().nullish(),
    select: z.array(z.string()).nullish(),
    select_line_num: z.number().nullish(),
    sorts: z.string().nullish(),
    sorts_line_num: z.number().nullish(),
    limit: z.string().nullish(),
    limit_line_num: z.number().nullish(),
    type: z.enum(ChartTypeEnum).nullish(),
    type_line_num: z.number().nullish(),
    data: zFileChartData.nullish(),
    data_line_num: z.number().nullish(),
    options: zFileChartOptions.nullish(),
    options_line_num: z.number().nullish(),
    plate: zFileChartPlate.nullish(),
    plate_line_num: z.number().nullish(),
    parameters: z.array(zFileTileParameter).nullish(),
    parameters_line_num: z.number().nullish(),
    malloyQueryStable: z.string().nullish(),
    malloyQueryExtra: z.string().nullish(),
    compiledQuery: z.any().nullish(),
    sql: z.array(z.string()).nullish(),
    sortingsAry: z
      .array(
        z.object({
          fieldId: z.string().nullish(),
          desc: z.boolean().nullish()
        })
      )
      .nullish(),
    listen: z.record(z.string(), z.string()).nullish(),
    combinedFilters: zFilterBricksDictionary.nullish(),
    filtersFractions: z.record(z.string(), z.array(zFraction)).nullish()
  })
  .meta({ id: 'FilePartTile' });

export type FilePartTile = z.infer<typeof zFilePartTile>;
