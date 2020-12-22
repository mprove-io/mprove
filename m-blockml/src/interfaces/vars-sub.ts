import { api } from '../barrels/api';

export interface VarsSub {
  view?: any;
  select?: string[];
  weekStart?: api.ProjectWeekStartEnum;
  connection?: api.ProjectConnection;
  structId?: string;
  udfsDict?: api.UdfsDict;
  depMeasures?: {
    [dep: string]: number;
  };
  depDimensions?: {
    [dep: string]: number;
  };
  mainText?: string[];
  groupMainBy?: string[];
  mainFields?: string[];
  selected?: {
    [s: string]: number;
  };
  processedFields?: {
    [s: string]: string;
  };
  extraUdfs?: {
    [s: string]: number;
  };
  needsAll?: {
    [a: string]: number;
  };
  contents?: string[];
  with?: string[];
  query?: string[];
  calcQuery?: string[];
}
