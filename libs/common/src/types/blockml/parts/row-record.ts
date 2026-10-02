import { z } from 'zod';

export let zRowRecord = z
  .object({
    id: z.number(),
    columnLabel: z.string(),
    key: z.number(),
    value: z.any(),
    error: z.any()
  })
  .meta({ id: 'RowRecord' });

export type RowRecord = z.infer<typeof zRowRecord>;
