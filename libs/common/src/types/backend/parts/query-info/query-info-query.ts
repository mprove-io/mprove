import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type QueryInfoQuery = {
  connectionId: string;
  connectionType: EnumValues<typeof ConnectionTypeEnum>;
  queryId: string;
  status: EnumValues<typeof QueryStatusEnum>;
  lastRunBy?: string;
  lastRunTs?: number;
  lastCancelTs?: number;
  lastCompleteTs?: number;
  lastCompleteDuration?: number;
  lastErrorMessage?: string;
  lastErrorTs?: number;
  data?: any;
  malloy?: string;
  sql?: string;
};

export let zQueryInfoQuery = z
  .object({
    connectionId: z.string(),
    connectionType: z.enum(ConnectionTypeEnum),
    queryId: z.string(),
    status: z.enum(QueryStatusEnum),
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
  })
  .meta({ id: 'QueryInfoQuery' });

assertTypesEqual<QueryInfoQuery, z.infer<typeof zQueryInfoQuery>>({
  value: true
});
