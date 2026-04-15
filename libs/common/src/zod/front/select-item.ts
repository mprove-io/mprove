import { z } from 'zod';

export let zfSelectItem = <T extends z.ZodType>(zT: T) =>
  z
    .object({
      value: zT,
      label: z.string()
    })
    .meta({ id: 'SelectItem' });
