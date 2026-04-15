import { z } from 'zod';

export let zSessionModelApi = z
  .object({
    id: z.string(),
    name: z.string(),
    providerId: z.string(),
    providerName: z.string(),
    variants: z.array(z.string()).nullish(),
    contextLimit: z.number().nullish()
  })
  .meta({ id: 'SessionModelApi' });

export type SessionModelApi = z.infer<typeof zSessionModelApi>;
