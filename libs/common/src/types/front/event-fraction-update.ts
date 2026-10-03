import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Fraction, zFraction } from '#common/types/blockml/parts/fraction';

export type EventFractionUpdate = { fraction: Fraction; fractionIndex: number };

export let zEventFractionUpdate = z
  .object({
    fraction: zFraction,
    fractionIndex: z.number()
  })
  .meta({ id: 'EventFractionUpdate' });

assertTypesEqual<EventFractionUpdate, z.infer<typeof zEventFractionUpdate>>({
  value: true
});
