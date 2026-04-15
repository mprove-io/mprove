import { z } from 'zod';
import { zFraction } from '#common/zod/blockml/fraction';

export let zEventFractionUpdate = z
  .object({
    fraction: zFraction,
    fractionIndex: z.number()
  })
  .meta({ id: 'EventFractionUpdate' });

export type EventFractionUpdate = z.infer<typeof zEventFractionUpdate>;
