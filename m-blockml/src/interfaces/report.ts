import { api } from '../barrels/api';
import { ChartData } from './chart/chart-data';
import { ChartAxis } from './chart/chart-axis';
import { ChartOptions } from './chart/chart-options';
import { ChartTile } from './chart/chart-tile';
import { FilterBricksDictionary } from './filter-bricks-dictionary';

export interface Report {
  title: string;
  title_line_num: number;

  description: string;
  description_line_num: number;

  model: string;
  model_line_num: number;

  select: string[];
  select_line_num: number;

  sorts: string;
  sorts_line_num: number;

  timezone: string;
  timezone_line_num: number;

  limit: string; // string
  limit_line_num: number;

  type: api.ChartTypeEnum;
  type_line_num: number;

  data: ChartData;
  data_line_num: number;

  axis: ChartAxis;
  axis_line_num: number;

  options: ChartOptions;
  options_line_num: number;

  tile: ChartTile;
  tile_line_num: number;

  listen_filters: {
    [dashboardFilterName: string]: string;
  };
  listen_filters_line_num: number;

  default_filters: FilterBricksDictionary;
  default_filters_line_num: number;

  //

  selectHash: {
    [element: string]: {
      [forceDim: string]: number;
    };
  };

  selectWithForceDims: string[];

  sortingsAry: {
    fieldId: string;
    desc: boolean;
  }[];

  listen: { [a: string]: string };

  combinedFilters: FilterBricksDictionary;

  filtersFractions: {
    [s: string]: api.Fraction[];
  };

  sql: string[];
}
