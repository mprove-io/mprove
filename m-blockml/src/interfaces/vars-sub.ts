export interface VarsSub {
  select?: string[];

  depMeasures?: { [dep: string]: number };

  depDimensions?: { [dep: string]: number };

  mainText?: string[];

  groupMainBy?: string[];

  selected?: { [s: string]: number };

  processedFields?: { [s: string]: string };

  needsAll?: { [a: string]: number };

  contents?: string[];

  myWith?: string[];

  mainQuery?: string[];

  sub?: string[];

  extraUdfs?: { [s: string]: number };
}
