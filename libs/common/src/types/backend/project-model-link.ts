import { z } from 'zod';

export let zProjectModelLink = z
  .object({
    projectId: z.string(),
    modelId: z.string(),
    navTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectModelLink' });

export type ProjectModelLink = z.infer<typeof zProjectModelLink>;
