import { z } from 'zod';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { zAppliedGivenValue } from '#common/types/blockml/parts/applied-given-value';
import { zFilter } from '#common/types/blockml/parts/filter';
import { zMconfigChart } from '#common/types/blockml/parts/mconfig-chart';
import { zSorting } from '#common/types/blockml/parts/sorting';
import { zStorePart } from '#common/types/blockml/parts/store-part';
import { zTimezone } from '#common/types/z-timezone';

export let zMconfig = z
  .object({
    structId: z.string(),
    mconfigId: z.string(),
    queryId: z.string(),
    modelId: z.string(),
    modelType: z.enum(ModelTypeEnum),
    parentType: z.enum(MconfigParentTypeEnum),
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

export type Mconfig = z.infer<typeof zMconfig>;
