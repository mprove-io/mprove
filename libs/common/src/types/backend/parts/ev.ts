import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type Ev = { evId: string; val: string };

export let zEv = z
  .object({
    evId: z.string(),
    val: z.string()
  })
  .meta({ id: 'Ev' });

assertTypesEqual<Ev, z.infer<typeof zEv>>({ value: true });
