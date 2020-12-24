import { api } from '../barrels/api';
import { FilterBricksDictionary } from './filter-bricks-dictionary';
import { ViewPart } from './view-part';

export interface VarsSql {
  weekStart?: api.ProjectWeekStartEnum;
  timezone?: string;
  select?: string[];
  sorts?: string;
  limit?: string;
  filters?: FilterBricksDictionary;
  filtersFractions?: { [s: string]: api.Fraction[] };
  depMeasures?: { [as: string]: { [dep: string]: number } };
  mainText?: string[];
  groupMainBy?: string[];
  mainFields?: { asName: string; fieldName: string; elementName: string }[];
  selected?: { [s: string]: number };
  processedFields?: { [s: string]: string };
  needsDoubles?: { [a: string]: { [f: string]: number } };
  joins?: { [s: string]: number };
  needsAll?: { [a: string]: { [f: string]: number } };
  whereMain?: FilterBricksDictionary;
  havingMain?: FilterBricksDictionary;
  whereCalc?: FilterBricksDictionary;
  filtersConditions?: FilterBricksDictionary;
  untouchedFiltersConditions?: FilterBricksDictionary;
  contents?: string[];
  myWith?: string[];
  withParts?: { [viewPartName: string]: ViewPart };
  joinsWhere?: string[];
  mainQuery?: string[];
  mainQueryProcessed?: string[];
  sql?: string[];
  mainUdfs?: { [s: string]: number };
}
