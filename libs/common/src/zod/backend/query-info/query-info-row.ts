import { z } from 'zod';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { zQueryInfoQuery } from '#common/zod/backend/query-info/query-info-query';
import { zParameter } from '#common/zod/blockml/parameter';

export let zQueryInfoRow = z
  .object({
    rowId: z.string(),
    name: z.string(),
    rowType: z.enum(RowTypeEnum),
    metricId: z.string(),
    formula: z.string(),
    parameters: z.array(zParameter),
    query: zQueryInfoQuery.nullish(),
    records: z.array(z.any()).nullish()
  })
  .meta({ id: 'QueryInfoRow' });

export type QueryInfoRow = z.infer<typeof zQueryInfoRow>;
