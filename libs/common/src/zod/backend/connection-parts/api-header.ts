import { z } from 'zod';

export let zApiHeader = z
  .object({
    key: z.string(),
    value: z.string()
  })
  .meta({ id: 'ApiHeader' });

export type ApiHeader = z.infer<typeof zApiHeader>;
