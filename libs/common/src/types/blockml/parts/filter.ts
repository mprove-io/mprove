import { z } from 'zod';
import { zFraction } from '#common/types/blockml/parts/fraction';

export let zFilter = z
  .object({
    fieldId: z.string(),
    fractions: z.array(zFraction)
  })
  .meta({ id: 'Filter' });

export type Filter = z.infer<typeof zFilter>;
