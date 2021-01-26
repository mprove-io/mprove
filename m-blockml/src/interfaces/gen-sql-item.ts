import { api } from '~/barrels/api';
import { Model } from './file-types/model';
import { FilterBricksDictionary } from './filter-bricks-dictionary';

export interface GenSqlItem {
  weekStart: api.ProjectWeekStartEnum;
  timezone: string;
  select: string[];
  sorts: string;
  limit: string;
  filters: FilterBricksDictionary;
  model: Model;
  udfsDict: api.UdfsDict;
}
