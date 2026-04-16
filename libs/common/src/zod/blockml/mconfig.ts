import { z } from 'zod';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { zFilter } from '#common/zod/blockml/filter';
import { zMconfigChart } from '#common/zod/blockml/mconfig-chart';
import { zSorting } from '#common/zod/blockml/sorting';
import { zStorePart } from '#common/zod/blockml/store-part';

// TODO: `parentId`, `dateRangeIncludesRightSide`, `storePart`,
// `modelFilePath`, `malloyQueryStable`, `malloyQueryExtra`, `sorts` tightened
// (removed `.nullish()`) to match the `Mconfig` interface's required TS
// fields so zod-typed mconfigs flow into node-common helpers (makeMalloyQuery)
// without extra `as any` casts. Revisit once node-common migrates to zod.
export let zMconfig = z
  .object({
    structId: z.string(),
    mconfigId: z.string(),
    queryId: z.string(),
    modelId: z.string(),
    modelType: z.enum(ModelTypeEnum),
    parentType: z.enum(MconfigParentTypeEnum),
    parentId: z.string(),
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
    chart: zMconfigChart,
    serverTs: z.number().int()
  })
  .meta({ id: 'Mconfig' });

export type Mconfig = z.infer<typeof zMconfig>;
