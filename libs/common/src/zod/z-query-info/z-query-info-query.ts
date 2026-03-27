import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';

export let zQueryInfoQuery = z.object({
  connectionId: z.string(),
  connectionType: z.enum(ConnectionTypeEnum),
  queryId: z.string(),
  status: z.enum(QueryStatusEnum),
  lastRunBy: z.string(),
  lastRunTs: z.number(),
  lastCancelTs: z.number(),
  lastCompleteTs: z.number(),
  lastCompleteDuration: z.number(),
  lastErrorMessage: z.string(),
  lastErrorTs: z.number(),
  data: z.any().optional(),
  malloy: z.string().optional(),
  sql: z.string().optional()
});
