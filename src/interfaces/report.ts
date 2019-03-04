import { api } from '../barrels/api';
import { ChartData } from './chart-data';
import { ChartAxis } from './chart-axis';
import { ChartOptions } from './chart-options';
import { ChartTile } from './chart-tile';
import { BqView } from './bq-view';

export interface Report {
  title: string;
  title_line_num: number;

  description: string;
  description_line_num: number;

  model: string;
  model_line_num: number;

  select: string[];
  select_line_num: number;

  select_hash: {
    [element: string]: {
      [forceDim: string]: number
    }
  };

  sorts: string;
  sorts_line_num: number;
  sortings_ary: {
    field_id: string,
    desc: string // boolean
  }[];

  timezone: string;
  timezone_line_num: number;

  limit: string; // string
  limit_line_num: number;

  listen_filters: {
    [dashboardFilterName: string]: string
  };
  listen_filters_line_num: number;

  default_filters: {
    [aliasFieldName: string]: string[];
  };
  default_filters_line_num: number;

  listen: { [a: string]: string };
  default: { [filter: string]: string[] };
  filters: { [filter: string]: string[] };

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

  filters_fractions: any;
  bq_views: BqView[];
}
