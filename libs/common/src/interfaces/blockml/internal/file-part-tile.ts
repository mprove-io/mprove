import { enums } from '~common/barrels/enums';
import { FilterBricksDictionary } from '../filter-bricks-dictionary';
import { Fraction } from '../fraction';
import { VarsSqlStep } from '../internal/vars-sql-step';
import { JoinAggregation } from '../join-aggregation';
import { FileChartAxis } from './file-chart-axis';
import { FileChartData } from './file-chart-data';
import { FileChartOptions } from './file-chart-options';
import { FileChartPlate } from './file-chart-plate';

export interface FilePartTile {
  title?: string;
  title_line_num?: number;

  description?: string;
  description_line_num?: number;

  model?: string;
  model_line_num?: number;

  select?: string[];
  select_line_num?: number;

  sorts?: string;
  sorts_line_num?: number;

  timezone?: string;
  timezone_line_num?: number;

  limit?: string; // string
  limit_line_num?: number;

  type?: enums.ChartTypeEnum;
  type_line_num?: number;

  data?: FileChartData;
  data_line_num?: number;

  axis?: FileChartAxis;
  axis_line_num?: number;

  options?: FileChartOptions;
  options_line_num?: number;

  plate?: FileChartPlate;
  plate_line_num?: number;

  listen_filters?: {
    [dashboardFilterName: string]: string;
  };
  listen_filters_line_num?: number;

  default_filters?: FilterBricksDictionary;
  default_filters_line_num?: number;

  //

  sortingsAry?: {
    fieldId?: string;
    desc?: boolean;
  }[];

  listen?: { [a: string]: string };

  combinedFilters?: FilterBricksDictionary;

  filtersFractions?: {
    [s: string]: Fraction[];
  };

  sql?: string[];

  joinAggregations?: JoinAggregation[];

  unsafeSelect?: string[];

  warnSelect?: string[];

  varsSqlSteps?: VarsSqlStep[];
}
