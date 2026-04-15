import { z } from 'zod';

export let zStorePart = z
  .object({
    reqTemplate: z.string(),
    reqFunction: z.string(),
    reqJsonParts: z.string(),
    reqBody: z.string(),
    reqUrlPath: z.string()
  })
  .meta({ id: 'StorePart' });

export type StorePart = z.infer<typeof zStorePart>;
