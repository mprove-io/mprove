import { api } from '../barrels/api';
import { View } from './view';
import { UdfsDict } from './udfs-dict';
import { BqView } from './bq-view';

export interface VarsSub {
  view: View;

  select: string[];

  timezone: string;

  weekStart: api.ProjectWeekStartEnum;
  connection: api.ProjectConnectionEnum;

  bqProject: string;

  projectId: string;

  structId: string;

  udfsDict: UdfsDict;

  depMeasures: {
    [dep: string]: number;
  };

  depDimensions: {
    [dep: string]: number;
  };

  mainText: string[];

  groupMainBy: string[];

  mainFields: string[];

  selected: {
    [s: string]: number;
  };

  processedFields: {
    [s: string]: string;
  };

  extraUdfs: {
    [s: string]: number;
  };

  needsAll: {
    [a: string]: number;
  };

  contents: string[];

  bqViews: BqView[];

  with: string[];

  query: string[];
  calcQuery: string[];
}
