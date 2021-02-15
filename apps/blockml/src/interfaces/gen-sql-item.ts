import { common } from '~blockml/barrels/common';
import { Model } from './file-types/model';
import { FilterBricksDictionary } from './filter-bricks-dictionary';

export interface GenSqlItem {
  weekStart: common.ProjectWeekStartEnum;
  timezone: string;
  select: string[];
  sorts: string;
  limit: string;
  filters: FilterBricksDictionary;
  model: Model;
  udfsDict: common.UdfsDict;
}
