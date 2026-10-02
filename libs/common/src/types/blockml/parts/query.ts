import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { StoreMethodEnum } from '#common/enums/store-method.enum';

export let zQuery = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    connectionType: z.enum(ConnectionTypeEnum),
    queryId: z.string(),
    reportId: z.string().nullish(),
    reportStructId: z.string().nullish(),
    sql: z.string().nullish(),
    apiMethod: z.enum(StoreMethodEnum).nullish(),
    apiUrl: z.string().nullish(),
    apiBody: z.any(),
    status: z.enum(QueryStatusEnum),
    data: z.any().nullish(),
    lastRunBy: z.string().nullish(),
    lastRunTs: z.number().int().nullish(),
    lastCancelTs: z.number().int().nullish(),
    lastCompleteTs: z.number().int().nullish(),
    lastCompleteDuration: z.number().nullish(),
    lastErrorMessage: z.string().nullish(),
    lastErrorTs: z.number().int().nullish(),
    queryJobId: z.string().nullish(),
    bigqueryQueryJobId: z.string().nullish(),
    bigqueryConsecutiveErrorsGetJob: z.number().int(),
    bigqueryConsecutiveErrorsGetResults: z.number().int(),
    serverTs: z.number().int()
  })
  .meta({ id: 'Query' });

export type Query = z.infer<typeof zQuery>;
