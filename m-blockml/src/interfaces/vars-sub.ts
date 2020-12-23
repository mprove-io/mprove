export interface VarsSub {
  select?: string[];
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
  myWith?: string[];
  mainQuery?: string[];
  calcQuery?: string[];
}
