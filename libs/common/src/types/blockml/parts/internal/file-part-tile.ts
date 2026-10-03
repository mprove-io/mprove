import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FilterBricksDictionary,
  zFilterBricksDictionary
} from '#common/types/blockml/parts/filter-bricks-dictionary';
import { type Fraction, zFraction } from '#common/types/blockml/parts/fraction';
import {
  type FileChartData,
  zFileChartData
} from '#common/types/blockml/parts/internal/file-chart-data';
import {
  type FileChartOptions,
  zFileChartOptions
} from '#common/types/blockml/parts/internal/file-chart-options';
import {
  type FileChartPlate,
  zFileChartPlate
} from '#common/types/blockml/parts/internal/file-chart-plate';
import {
  type FileTileParameter,
  zFileTileParameter
} from '#common/types/blockml/parts/internal/file-tile-parameter';
import type { EnumValues } from '#common/types/enum-values';

export type FilePartTile = {
  title?: string;
  title_line_num?: number;
  model?: string;
  model_line_num?: number;
  select?: string[];
  select_line_num?: number;
  sorts?: string;
  sorts_line_num?: number;
  limit?: string;
  limit_line_num?: number;
  type?: EnumValues<typeof ChartTypeEnum>;
  type_line_num?: number;
  data?: FileChartData;
  data_line_num?: number;
  options?: FileChartOptions;
  options_line_num?: number;
  plate?: FileChartPlate;
  plate_line_num?: number;
  parameters?: FileTileParameter[];
  parameters_line_num?: number;
  malloyQueryStable?: string;
  malloyQueryExtra?: string;
  compiledQuery?: any;
  sql?: string[];
  sortingsAry?: { fieldId?: string; desc?: boolean }[];
  listen?: Record<string, string>;
  combinedFilters?: FilterBricksDictionary;
  filtersFractions?: Record<string, Fraction[]>;
};

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

assertTypesEqual<FilePartTile, z.infer<typeof zFilePartTile>>({ value: true });
