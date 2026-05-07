import { z } from 'zod';

export let zCachedColumn = z.object({
  projectId: z.string(),
  connectionId: z.string(),
  envId: z.string(),
  schemaName: z.string(),
  tableName: z.string(),
  columnName: z.string(),
  requestedByUserId: z.string().nullish(),
  status: z.enum(['running', 'completed', 'error']),
  errorMessage: z.string().nullish(),
  startedTs: z.number(),
  completedTs: z.number().nullish(),
  completedDurationMs: z.number().nullish(),
  limit: z.number(),
  sampleSize: z.number().nullish(),
  isLimitReached: z.boolean().nullish(),
  serverTs: z.number(),
  uniqueValuesCount: z.number().nullish()
});

export type CachedColumn = z.infer<typeof zCachedColumn>;
