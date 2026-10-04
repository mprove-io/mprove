import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type AppliedGivenValue,
  zAppliedGivenValue
} from '#common/types/backend/parts/given/applied-given-value';
import {
  type Filter,
  zFilter
} from '#common/types/blockml/parts/filter/filter';
import {
  type MconfigChart,
  zMconfigChart
} from '#common/types/blockml/parts/mconfig/mconfig-chart';
import {
  type MconfigParentType,
  zMconfigParentType
} from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import {
  type ModelType,
  zModelType
} from '#common/types/blockml/parts/model/model-type';
import {
  type Sorting,
  zSorting
} from '#common/types/blockml/parts/query/sorting';
import {
  type StorePart,
  zStorePart
} from '#common/types/blockml/parts/store/store-part';

import {
  type TimezoneString,
  zTimezone
} from '#common/types/shared/timezone/z-timezone';

export type Mconfig = {
  structId: string;
  mconfigId: string;
  queryId: string;
  modelId: string;
  modelType: ModelType;
  parentType: MconfigParentType;
  parentId?: string;
  dateRangeIncludesRightSide?: boolean;
  storePart?: StorePart;
  modelLabel: string;
  modelFilePath?: string;
  malloyQueryStable?: string;
  malloyQueryExtra?: string;
  compiledQuery: any;
  select: string[];
  sortings: Sorting[];
  sorts?: string;
  timezone: TimezoneString;
  limit: number;
  filters: Filter[];
  appliedGivens?: Record<string, AppliedGivenValue>;
  chart: MconfigChart;
  serverTs: number;
};

export let zMconfig = z
  .object({
    structId: z.string(),
    mconfigId: z.string(),
    queryId: z.string(),
    modelId: z.string(),
    modelType: zModelType,
    parentType: zMconfigParentType,
    parentId: z.string().nullish(),
    dateRangeIncludesRightSide: z.boolean().nullish(),
    storePart: zStorePart.nullish(),
    modelLabel: z.string(),
    modelFilePath: z.string().nullish(),
    malloyQueryStable: z.string().nullish(),
    malloyQueryExtra: z.string().nullish(),
    compiledQuery: z.any(),
    select: z.array(z.string()),
    sortings: z.array(zSorting),
    sorts: z.string().nullish(),
    timezone: zTimezone,
    limit: z.number(),
    filters: z.array(zFilter),
    appliedGivens: z.record(z.string(), zAppliedGivenValue).nullish(),
    chart: zMconfigChart,
    serverTs: z.number().int()
  })
  .meta({ id: 'Mconfig' });

assertTypesEqual<Mconfig, z.infer<typeof zMconfig>>({ value: true });
