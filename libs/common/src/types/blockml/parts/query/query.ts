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
import {
  type StoreMethod,
  zStoreMethod
} from '#common/types/blockml/parts/store/store-method';

export type Query = {
  projectId: string;
  envId: string;
  connectionId: string;
  connectionType: ConnectionType;
  queryId: string;
  reportId?: string;
  reportStructId?: string;
  sql?: string;
  apiMethod?: StoreMethod;
  apiUrl?: string;
  apiBody: any;
  status: QueryStatus;
  data?: any;
  lastRunBy?: string;
  lastRunTs?: number;
  lastCancelTs?: number;
  lastCompleteTs?: number;
  lastCompleteDuration?: number;
  lastErrorMessage?: string;
  lastErrorTs?: number;
  queryJobId?: string;
  bigqueryQueryJobId?: string;
  bigqueryConsecutiveErrorsGetJob: number;
  bigqueryConsecutiveErrorsGetResults: number;
  serverTs: number;
};

export let zQuery = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    connectionType: zConnectionType,
    queryId: z.string(),
    reportId: z.string().nullish(),
    reportStructId: z.string().nullish(),
    sql: z.string().nullish(),
    apiMethod: zStoreMethod.nullish(),
    apiUrl: z.string().nullish(),
    apiBody: z.any(),
    status: zQueryStatus,
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

assertTypesEqual<Query, z.infer<typeof zQuery>>({ value: true });
