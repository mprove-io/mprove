import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type QueryEstimate,
  zQueryEstimate
} from '#common/types/backend/parts/query-estimate';
import { type Query, zQuery } from '#common/types/blockml/parts/query';

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
