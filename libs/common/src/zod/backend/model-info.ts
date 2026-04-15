import { z } from 'zod';

export let zModelInfo = z
  .object({
    name: z.string(),
    connectionId: z.string(),
    presetId: z.string().nullish(),
    accessRoles: z.array(z.string()).nullish()
  })
  .meta({ id: 'ModelInfo' });

export type ModelInfo = z.infer<typeof zModelInfo>;
