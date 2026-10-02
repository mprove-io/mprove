import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type AppliedGivenValue,
  zAppliedGivenValue
} from '#common/types/blockml/parts/applied-given-value';
import { type Filter, zFilter } from '#common/types/blockml/parts/filter';
import {
  type MconfigChart,
  zMconfigChart
} from '#common/types/blockml/parts/mconfig-chart';
import { type Sorting, zSorting } from '#common/types/blockml/parts/sorting';
import {
  type StorePart,
  zStorePart
} from '#common/types/blockml/parts/store-part';

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

export let zMconfigLt = z
  .object({
    dateRangeIncludesRightSide: z.boolean(),
    storePart: zStorePart,
    modelLabel: z.string(),
    modelFilePath: z.string(),
    malloyQueryStable: z.string(),
    malloyQueryExtra: z.string(),
    compiledQuery: z.any(),
    select: z.array(z.string()),
    sortings: z.array(zSorting),
    sorts: z.string(),
    timezone: z.string(),
    limit: z.number(),
    filters: z.array(zFilter),
    appliedGivens: z.record(z.string(), zAppliedGivenValue).nullish(),
    chart: zMconfigChart
  })
  .meta({ id: 'MconfigLt' });

assertTypesEqual<MconfigLt, z.infer<typeof zMconfigLt>>({ value: true });
