import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type QueryStatus,
  zQueryStatus
} from '#common/types/blockml/parts/query/query-status';

export type RunQuery = {
  queryId: string;
  status: QueryStatus;
  lastErrorMessage?: string;
};

export let zRunQuery = z
  .object({
    queryId: z.string(),
    status: zQueryStatus,
    lastErrorMessage: z.string().nullish()
  })
  .meta({ id: 'RunQuery' });

assertTypesEqual<RunQuery, z.infer<typeof zRunQuery>>({ value: true });
