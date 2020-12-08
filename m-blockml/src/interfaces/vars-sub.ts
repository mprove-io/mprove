import { api } from '../barrels/api';
import { View } from './file-types/view';
import { UdfsDict } from './udfs-dict';

export interface VarsSub {
  view: View;
  select: string[];
  weekStart: api.ProjectWeekStartEnum;
  connection: api.ProjectConnection;
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
  with: string[];
  query: string[];
  calcQuery: string[];
}
