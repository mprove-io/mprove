import { z } from 'zod';
import { QueryStatusEnum } from '#common/enums/query-status.enum';

export let zRunQuery = z
  .object({
    queryId: z.string(),
    status: z.enum(QueryStatusEnum),
    lastErrorMessage: z.string().nullish()
  })
  .meta({ id: 'RunQuery' });

export type RunQuery = z.infer<typeof zRunQuery>;
