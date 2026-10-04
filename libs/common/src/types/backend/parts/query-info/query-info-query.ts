import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionType,
  zConnectionType
} from '#common/types/backend/parts/connection-parts/connection-type';
import {
  type QueryStatus,
  zQueryStatus
} from '#common/types/blockml/parts/query/query-status';

export type QueryInfoQuery = {
  connectionId: string;
  connectionType: ConnectionType;
  queryId: string;
  status: QueryStatus;
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
    connectionType: zConnectionType,
    queryId: z.string(),
    status: zQueryStatus,
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
