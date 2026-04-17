import { z } from 'zod';
import { zBmlError } from '#common/zod/blockml/bml-error';

export let zBmlErrorExtra = zBmlError
  .extend({
    errorExt: z.any(),
    sortOrder: z.number()
  })
  .meta({ id: 'BmlErrorExtra' });

export type BmlErrorExtra = z.infer<typeof zBmlErrorExtra>;
