import type { ChartType } from '#common/types/blockml/parts/chart/chart-type';

import type { FilterBricksDictionary } from '#common/types/blockml/parts/filter/filter-bricks-dictionary';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FileChartData } from '#common/types/blockml/parts/internal/file-chart-data';
import type { FileChartOptions } from '#common/types/blockml/parts/internal/file-chart-options';
import type { FileChartPlate } from '#common/types/blockml/parts/internal/file-chart-plate';
import type { FileTileParameter } from '#common/types/blockml/parts/internal/file-tile-parameter';

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
  type?: ChartType;
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
