import { z } from 'zod';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { zParameter } from '#common/zod/blockml/parameter';

export let zRowChange = z
  .object({
    rowId: z.string().nullish(),
    name: z.string().nullish(),
    rowType: z.enum(RowTypeEnum).nullish(),
    metricId: z.string().nullish(),
    formula: z.string().nullish(),
    showChart: z.boolean().nullish(),
    parameters: z.array(zParameter).nullish(),
    formatNumber: z.string().nullish(),
    currencyPrefix: z.string().nullish(),
    currencySuffix: z.string().nullish()
  })
  .meta({ id: 'RowChange' });

export type RowChange = z.infer<typeof zRowChange>;
