import { api } from '../barrels/api';
import { Model } from './file-types/model';
import { FilterBricksDictionary } from './filter-bricks-dictionary';
import { ViewPart } from './view-part';

export interface VarsSql {
  model: Model;
  select: string[];
  sorts: string;
  timezone: string;
  limit: string;
  filters: FilterBricksDictionary;
  filtersFractions: {
    [s: string]: api.Fraction[];
  };
  weekStart: api.ProjectWeekStartEnum;
  structId: string;
  udfsDict: api.UdfsDict;
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
  with: string[];
  withParts: {
    [viewPartName: string]: ViewPart;
  };
  joinsWhere: string[];
  query: string[];
}
