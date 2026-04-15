import { z } from 'zod';

export let zfWrapResult = <T extends z.ZodType>(zT: T) =>
  z
    .object({
      data: zT,
      durationMs: z.number(),
      error: z.any(),
      errorStr: z.string()
    })
    .meta({ id: 'WrapResult' });
