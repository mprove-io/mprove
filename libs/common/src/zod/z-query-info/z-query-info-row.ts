import { z } from 'zod';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { zParameter } from '#common/zod/z-query-info/z-parameter';
import { zQueryInfoQuery } from '#common/zod/z-query-info/z-query-info-query';

export let zQueryInfoRow = z.object({
  rowId: z.string().nullish(),
  name: z.string().nullish(),
  rowType: z.enum(RowTypeEnum).nullish(),
  metricId: z.string().nullish(),
  formula: z.string().nullish(),
  parameters: z.array(zParameter).nullish(),
  query: zQueryInfoQuery.nullish(),
  records: z.array(z.any()).nullish()
});
