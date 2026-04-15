import { z } from 'zod';

export let zModelPart = z
  .object({
    structId: z.string(),
    modelId: z.string(),
    accessRoles: z.array(z.string())
  })
  .meta({ id: 'ModelPart' });

export type ModelPart = z.infer<typeof zModelPart>;
