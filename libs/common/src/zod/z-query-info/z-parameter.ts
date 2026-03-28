import { z } from 'zod';
import { zFraction } from '#common/zod/z-query-info/z-fraction';

export let zParameter = z.object({
  apply_to: z.string().nullish(),
  listen: z.string().nullish(),
  fractions: z.array(zFraction).nullish()
});
