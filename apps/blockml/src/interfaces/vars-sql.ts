import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { FilterBricksDictionary } from './filter-bricks-dictionary';
import { ViewPart } from './view-part';

export interface VarsSql {
  weekStart?: common.ProjectWeekStartEnum;
  timezone?: string;
  select?: string[];
  sorts?: string;
  limit?: string;
  filters?: FilterBricksDictionary;
  filtersFractions?: { [s: string]: apiToBlockml.Fraction[] };

  depMeasures?: { [as: string]: { [fieldName: string]: number } };
  depDimensions?: { [as: string]: { [fieldName: string]: number } };
  mainText?: string[];
  groupMainBy?: string[];
  selected?: { [element: string]: { asName: string; fieldName: string } };
  filtered?: { [element: string]: { asName: string; fieldName: string } };
  processedFields?: { [element: string]: string };
  needsDoubles?: { [as: string]: { [fieldName: string]: number } };
  joins?: { [as: string]: number };
  needsAll?: { [as: string]: { [fieldName: string]: number } };

  whereMain?: FilterBricksDictionary;
  havingMain?: FilterBricksDictionary;
  whereCalc?: FilterBricksDictionary;
  filterFieldsConditions?: FilterBricksDictionary;

  withParts?: { [viewPartName: string]: ViewPart };
  withDerivedTables?: string[];
  withViews?: string[];
  top?: string[];
  mainQuery?: string[];
  mainQueryProcessed?: string[];
  sql?: string[];
  mainUdfs?: { [s: string]: number };
}
