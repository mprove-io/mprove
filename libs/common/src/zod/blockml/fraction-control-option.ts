import { z } from 'zod';

export let zFractionControlOption = z
  .object({
    value: z.string(),
    label: z.string().nullish()
  })
  .meta({ id: 'FractionControlOption' });

export type ZFractionControlOption = z.infer<typeof zFractionControlOption>;
