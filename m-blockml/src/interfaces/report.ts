import { api } from '../barrels/api';
import { ChartData } from './chart-data';
import { ChartAxis } from './chart-axis';
import { ChartOptions } from './chart-options';
import { ChartTile } from './chart-tile';
import { BqView } from './bq-view';

export interface Report {
  title: string;
  titleLineNum: number;

  description: string;
  descriptionLineNum: number;

  model: string;
  modelLineNum: number;

  select: string[];
  selectLineNum: number;

  selectHash: {
    [element: string]: {
      [forceDim: string]: number;
    };
  };

  sorts: string;
  sortsLineNum: number;
  sortingsAry: {
    fieldId: string;
    desc: string; // boolean
  }[];

  timezone: string;
  timezoneLineNum: number;

  limit: string; // string
  limitLineNum: number;

  listenFilters: {
    [dashboardFilterName: string]: string;
  };
  listenFiltersLineNum: number;

  defaultFilters: {
    [aliasFieldName: string]: string[];
  };
  defaultFiltersLineNum: number;

  listen: { [a: string]: string };
  default: { [filter: string]: string[] };
  filters: { [filter: string]: string[] };

  type: api.ChartTypeEnum;
  typeLineNum: number;

  data: ChartData;
  dataLineNum: number;

  axis: ChartAxis;
  axisLineNum: number;

  options: ChartOptions;
  optionsLineNum: number;

  tile: ChartTile;
  tileLineNum: number;

  filtersFractions: any;
  bqViews: BqView[];
}
