import { z } from 'zod';

export let zQueryInfoQuery = z.object({
  connectionId: z.string(),
  connectionType: z.string(),
  queryId: z.string(),
  status: z.string(),
  lastRunBy: z.string(),
  lastRunTs: z.number(),
  lastCancelTs: z.number(),
  lastCompleteTs: z.number(),
  lastCompleteDuration: z.number(),
  lastErrorMessage: z.string(),
  lastErrorTs: z.number(),
  data: z.any().optional(),
  sql: z.string().optional()
});
