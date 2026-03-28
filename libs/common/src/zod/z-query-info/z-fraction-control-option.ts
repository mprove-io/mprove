import { z } from 'zod';

export let zFractionControlOption = z.object({
  value: z.string().nullish(),
  label: z.string().nullish()
});
