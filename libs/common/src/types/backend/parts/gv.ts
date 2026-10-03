import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type Gv = { givenId: string; values: string[] };

export let zGv = z
  .object({
    givenId: z.string(),
    values: z.array(z.string())
  })
  .meta({ id: 'Gv' });

assertTypesEqual<Gv, z.infer<typeof zGv>>({ value: true });
