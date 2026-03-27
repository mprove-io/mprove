import { z } from 'zod';
import { QueryStatusEnum } from '#common/enums/query-status.enum';

export let zRunQuery = z.object({
  queryId: z.string().nullish(),
  status: z.enum(QueryStatusEnum).nullish(),
  lastErrorMessage: z.string().nullish()
});
