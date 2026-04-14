import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';

export let zQueryInfoQuery = z
  .object({
    connectionId: z.string(),
    connectionType: z.enum(ConnectionTypeEnum),
    queryId: z.string(),
    status: z.enum(QueryStatusEnum),
    lastRunBy: z.string().optional(),
    lastRunTs: z.number().optional(),
    lastCancelTs: z.number().optional(),
    lastCompleteTs: z.number().optional(),
    lastCompleteDuration: z.number().optional(),
    lastErrorMessage: z.string().optional(),
    lastErrorTs: z.number().optional(),
    data: z.any().optional(),
    malloy: z.string().optional(),
    sql: z.string().optional()
  })
  .meta({ id: 'QueryInfoQuery' });

export type ZQueryInfoQuery = z.infer<typeof zQueryInfoQuery>;
