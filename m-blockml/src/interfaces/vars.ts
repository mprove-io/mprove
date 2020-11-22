import { api } from '../barrels/api';
import { Model } from './file-types/model';
import { UdfsDict } from './udfs-dict';
import { BqView } from './bq-view';

export interface Vars {
  model: Model;
  select: string[];
  sorts: string;
  timezone: string;
  limit: string;
  filters: {
    [filter: string]: string[];
  };
  filtersFractions: {
    [s: string]: api.Fraction[];
  };
  weekStart: api.ProjectWeekStartEnum;
  connectionType: api.ConnectionTypeEnum;
  bqProject: string;
  projectId: string;
  structId: string;
  udfsDict: UdfsDict;
  depMeasures: {
    [as: string]: {
      [dep: string]: number;
    };
  };
  mainText: string[];
  groupMainBy: string[];
  mainFields: {
    asName: string;
    fieldName: string;
    elementName: string;
  }[];
  selected: {
    [s: string]: number;
  };
  processedFields: {
    [s: string]: string;
  };
  mainUdfs: {
    [s: string]: number;
  };
  needsDoubles: {
    [a: string]: {
      [f: string]: number;
    };
  };
  joins: {
    [s: string]: number;
  };
  needsAll: {
    [a: string]: {
      [f: string]: number;
    };
  };
  whereMain: {
    [s: string]: string[];
  };
  havingMain: {
    [s: string]: string[];
  };
  whereCalc: {
    [s: string]: string[];
  };
  filtersConditions: {
    [s: string]: string[];
  };
  untouchedFiltersConditions: {
    [s: string]: string[];
  };
  contents: string[];
  bqViews: BqView[];
  with: string[];
  withParts: {
    [viewPartName: string]: {
      content: string;
      contentPrepared: string;
      parentViewName: string;
      deps: { [depName: string]: number };
    };
  };
  joinsWhere: string[];
  query: string[];
}
