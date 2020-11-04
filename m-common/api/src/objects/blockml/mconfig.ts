import { Sorting } from './sorting';
import { Filter } from './filter';
import { Chart } from './chart';

export class Mconfig {
  mconfigId: string;
  queryId: string;
  projectId: string;
  repoId: string;
  structId: string;
  modelId: string;
  select: string[];
  sortings: Sorting[];
  sorts: string;
  timezone: string;
  limit: number;
  filters: Filter[];
  charts: Chart[];
  temp: boolean;
  serverTs: number;
}
