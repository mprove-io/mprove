import { CompiledQuery } from '@malloydata/malloy/dist/model';
import { enums } from '~common/barrels/enums';
import { FilterBricksDictionary } from '../filter-bricks-dictionary';
import { Fraction } from '../fraction';
import { VarsSqlStep } from '../internal/vars-sql-step';
import { JoinAggregation } from '../join-aggregation';
import { FileChartData } from './file-chart-data';
import { FileChartOptions } from './file-chart-options';
import { FileChartPlate } from './file-chart-plate';
import { FileTileParameter } from './file-tile-parameter';

export interface FilePartTile {
  title?: string;
  title_line_num?: number;

  description?: string;
  description_line_num?: number;

  // query?: string;
  // query_line_num?: number;

  model?: string;
  model_line_num?: number;

  select?: string[];
  select_line_num?: number;

  sorts?: string;
  sorts_line_num?: number;

  limit?: string; // string
  limit_line_num?: number;

  type?: enums.ChartTypeEnum;
  type_line_num?: number;

  data?: FileChartData;
  data_line_num?: number;

  // axis?: FileChartAxis;
  // axis_line_num?: number;

  options?: FileChartOptions;
  options_line_num?: number;

  plate?: FileChartPlate;
  plate_line_num?: number;

  parameters?: FileTileParameter[];
  parameters_line_num?: number;

  //

  malloyQuery?: string;

  compiledQuery?: CompiledQuery;

  sql?: string[];

  sortingsAry?: {
    fieldId?: string;
    desc?: boolean;
  }[];

  listen?: { [a: string]: string };

  combinedFilters?: FilterBricksDictionary;

  filtersFractions?: {
    [s: string]: Fraction[];
  };

  joinAggregations?: JoinAggregation[];

  unsafeSelect?: string[];

  warnSelect?: string[];

  varsSqlSteps?: VarsSqlStep[];
}
