import { z } from 'zod';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { zQueryInfoQuery } from '#common/zod/z-query-info/z-query-info-query';

export let zQueryInfoRow = z.object({
  rowId: z.string(),
  name: z.string(),
  rowType: z.enum(RowTypeEnum),
  metricId: z.string(),
  formula: z.string(),
  parameters: z.array(z.any()),
  query: zQueryInfoQuery.optional(),
  records: z.array(z.any()).optional()
});
