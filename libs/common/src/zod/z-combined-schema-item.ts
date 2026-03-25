import { z } from 'zod';
import { zCombinedSchema } from '#common/zod/z-combined-schema';

export let zCombinedSchemaItem = z.object({
  connectionId: z.string(),
  schemas: z.array(zCombinedSchema),
  lastRefreshedTs: z.number(),
  errorMessage: z.string().optional()
});
