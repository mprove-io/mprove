import { z } from 'zod';
import { zFraction } from '#common/types/blockml/parts/fraction';

export let zEventFractionUpdate = z
  .object({
    fraction: zFraction,
    fractionIndex: z.number()
  })
  .meta({ id: 'EventFractionUpdate' });

export type EventFractionUpdate = z.infer<typeof zEventFractionUpdate>;
