import { Sorting } from './sorting';
import { Filter } from './filter';
import { Chart } from './chart';

export interface Mconfig {
  mconfig_id: string;
  query_id: string;
  project_id: string;
  repo_id: string;
  struct_id: string;
  model_id: string;
  select: string[];
  sortings: Sorting[];
  sorts: string;
  timezone: string;
  limit: number;
  filters: Filter[];
  charts: Chart[];
  temp: boolean;
  server_ts: number;
}
