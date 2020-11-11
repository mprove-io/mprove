import { api } from '../barrels/api';
import { View } from './file-types/view';
import { UdfsDict } from './udfs-dict';
import { BqView } from './bq-view';

export interface VarsSub {
  view: View;
  select: string[];
  timezone: string;
  weekStart: api.ProjectWeekStartEnum;
  connectionType: api.ConnectionTypeEnum;
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
