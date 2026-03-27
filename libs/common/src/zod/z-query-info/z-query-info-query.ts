import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';

export let zQueryInfoQuery = z.object({
  connectionId: z.string().nullish(),
  connectionType: z.enum(ConnectionTypeEnum).nullish(),
  queryId: z.string().nullish(),
  status: z.enum(QueryStatusEnum).nullish(),
  lastRunBy: z.string().nullish(),
  lastRunTs: z.number().nullish(),
  lastCancelTs: z.number().nullish(),
  lastCompleteTs: z.number().nullish(),
  lastCompleteDuration: z.number().nullish(),
  lastErrorMessage: z.string().nullish(),
  lastErrorTs: z.number().nullish(),
  data: z.any().nullish(),
  malloy: z.string().nullish(),
  sql: z.string().nullish()
});
