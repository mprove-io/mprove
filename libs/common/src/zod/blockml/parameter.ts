import { z } from 'zod';
import { zFraction } from '#common/zod/blockml/fraction';

export let zParameter = z
  .object({
    apply_to: z.string(),
    listen: z.string(),
    fractions: z.array(zFraction)
  })
  .meta({ id: 'Parameter' });

export type ZParameter = z.infer<typeof zParameter>;
