import { z } from 'zod';

export let zFileStoreFractionControlOption = z
  .object({
    value: z.string(),
    value_line_num: z.number(),
    label: z.string(),
    label_line_num: z.number()
  })
  .meta({ id: 'FileStoreFractionControlOption' });

export type FileStoreFractionControlOption = z.infer<
  typeof zFileStoreFractionControlOption
>;
