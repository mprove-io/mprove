import { z } from 'zod';
import { zRow } from '#common/zod/blockml/row';

export let zDataRow = zRow
  .extend({
    showMetricsParameters: z.boolean(),
    finalRowHeight: z.number()
  })
  .meta({ id: 'DataRow' });

export type DataRow = z.infer<typeof zDataRow>;
