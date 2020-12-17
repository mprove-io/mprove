import { BmError } from '../models/bm-error';
import { Model } from './file-types/model';
import { FilterBricksDictionary } from './filter-bricks-dictionary';
import { api } from '../barrels/api';
import { enums } from '../barrels/enums';

export interface GenSqlItem {
  model: Model;
  select: string[];
  sorts: string;
  timezone: string;
  limit: string;
  filters: FilterBricksDictionary;
  udfsDict: api.UdfsDict;
  weekStart: api.ProjectWeekStartEnum;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}
