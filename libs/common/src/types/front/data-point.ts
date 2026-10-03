import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type DataPoint = { columnId: number; columnLabel: string } & Record<
  string,
  any
>;

export let zDataPoint = z
  .intersection(
    z.object({
      columnId: z.number(),
      columnLabel: z.string()
    }),
    z.record(z.string(), z.any())
  )
  .meta({ id: 'DataPoint' });

assertTypesEqual<DataPoint, z.infer<typeof zDataPoint>>({ value: true });
