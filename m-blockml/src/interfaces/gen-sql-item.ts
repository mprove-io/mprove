import { Model } from './file-types/model';
import { FilterBricksDictionary } from './filter-bricks-dictionary';
import { api } from '../barrels/api';
import { VarsSqlElement } from './vars-sql-element';

export interface GenSqlItem {
  model: Model;
  select: string[];
  sorts: string;
  timezone: string;
  limit: string;
  filters: FilterBricksDictionary;
  udfsDict: api.UdfsDict;
  weekStart: api.ProjectWeekStartEnum;
  varsSqlElements: VarsSqlElement[];
  structId: string;
}
