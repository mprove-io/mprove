import type { AppliedGivenValue } from '#common/types/backend/parts/given/applied-given-value';
import type { Filter } from '#common/types/blockml/parts/filter/filter';
import type { MconfigChart } from '#common/types/blockml/parts/mconfig/mconfig-chart';
import type { Sorting } from '#common/types/blockml/parts/query/sorting';
import type { StorePart } from '#common/types/blockml/parts/store/store-part';

export type MconfigLt = {
  dateRangeIncludesRightSide: boolean;
  storePart: StorePart;
  modelLabel: string;
  modelFilePath: string;
  malloyQueryStable: string;
  malloyQueryExtra: string;
  compiledQuery: any;
  select: string[];
  sortings: Sorting[];
  sorts: string;
  timezone: string;
  limit: number;
  filters: Filter[];
  appliedGivens?: Record<string, AppliedGivenValue>;
  chart: MconfigChart;
};
