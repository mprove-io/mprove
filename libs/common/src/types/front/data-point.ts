import { z } from 'zod';

export let zDataPoint = z
  .intersection(
    z.object({
      columnId: z.number(),
      columnLabel: z.string()
    }),
    z.record(z.string(), z.any())
  )
  .meta({ id: 'DataPoint' });

export type DataPoint = z.infer<typeof zDataPoint>;
