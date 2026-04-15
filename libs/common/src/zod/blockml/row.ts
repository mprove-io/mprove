import { z } from 'zod';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { zMconfigX } from '#common/zod/backend/mconfig-x';
import { zFilter } from '#common/zod/blockml/filter';
import { zParameter } from '#common/zod/blockml/parameter';
import { zQuery } from '#common/zod/blockml/query';
import { zRowRecord } from '#common/zod/blockml/row-record';
import { zRq } from '#common/zod/blockml/rq';

export let zRow = z
  .object({
    rowId: z.string(),
    name: z.string(),
    rowType: z.enum(RowTypeEnum),
    metricId: z.string(),
    modelId: z.string(),
    topLabel: z.string(),
    partNodeLabel: z.string(),
    partFieldLabel: z.string(),
    partLabel: z.string(),
    timeNodeLabel: z.string(),
    timeFieldLabel: z.string(),
    timeLabel: z.string(),
    formulaError: z.string().nullish(),
    topQueryError: z.string().nullish(),
    hasAccessToModel: z.boolean(),
    mconfig: zMconfigX,
    query: zQuery,
    showChart: z.boolean(),
    rqs: z.array(zRq),
    records: z.array(zRowRecord),
    formatNumber: z.string(),
    currencyPrefix: z.string(),
    currencySuffix: z.string(),
    parameters: z.array(zParameter),
    parametersFiltersWithExcludedTime: z.array(zFilter),
    formula: z.string(),
    formulaDeps: z.array(z.string()),
    deps: z.array(z.string())
  })
  .meta({ id: 'Row' });

export type Row = z.infer<typeof zRow>;
