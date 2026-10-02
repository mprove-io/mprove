import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type QueryEstimate,
  zQueryEstimate
} from '#common/types/backend/query-estimate';
import { type Query, zQuery } from '#common/types/blockml/query';

export type ToBackendRunQueriesDryOutput = {
  dryId: string;
  validQueryEstimates: QueryEstimate[];
  errorQueries: Query[];
};

export let zToBackendRunQueriesDryOutput = z
  .object({
    dryId: z.string(),
    validQueryEstimates: z.array(zQueryEstimate),
    errorQueries: z.array(zQuery)
  })
  .meta({ id: 'ToBackendRunQueriesDryOutput' });

assertTypesEqual<
  ToBackendRunQueriesDryOutput,
  z.infer<typeof zToBackendRunQueriesDryOutput>
>({ value: true });
