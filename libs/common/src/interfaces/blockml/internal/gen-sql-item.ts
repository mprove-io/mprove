import { enums } from '~common/barrels/enums';
import { FilterBricksDictionary } from '../filter-bricks-dictionary';
import { UdfsDict } from '../udfs-dict';
import { FileModel } from './file-model';

export interface GenSqlItem {
  weekStart: enums.ProjectWeekStartEnum;
  caseSensitiveStringFilters: boolean;
  simplifySafeAggregates: boolean;
  timezone: string;
  select: string[];
  sorts: string;
  limit: string;
  filters: FilterBricksDictionary;
  model: FileModel;
  udfsDict: UdfsDict;
}
