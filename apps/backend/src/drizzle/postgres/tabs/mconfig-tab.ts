import { CompiledQuery } from '@malloydata/malloy/dist/model';
import { Filter } from '~common/interfaces/blockml/filter';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { Sorting } from '~common/interfaces/blockml/sorting';
import { StorePart } from '~common/interfaces/blockml/store-part';
import { MconfigEnt } from '../schema/mconfigs';

export interface MconfigTab
  extends Omit<MconfigEnt, 'st' | 'lt'>,
    MconfigSt,
    MconfigLt {}

export class MconfigSt {
  emptyData?: number;
}

export class MconfigLt {
  dateRangeIncludesRightSide: boolean;
  storePart: StorePart;
  modelLabel: string;
  modelFilePath: string;
  malloyQueryStable: string;
  malloyQueryExtra: string;
  compiledQuery: CompiledQuery;
  select: string[];
  sortings: Sorting[];
  sorts: string;
  timezone: string;
  limit: number;
  filters: Filter[];
  chart: MconfigChart;
}
