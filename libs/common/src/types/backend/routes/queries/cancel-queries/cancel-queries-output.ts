import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Query, zQuery } from '#common/types/blockml/parts/query/query';

export type ToBackendCancelQueriesOutput = {
  queries: Query[];
};

export let zToBackendCancelQueriesOutput = z
  .object({
    queries: z.array(zQuery)
  })
  .meta({ id: 'ToBackendCancelQueriesOutput' });

assertTypesEqual<
  ToBackendCancelQueriesOutput,
  z.infer<typeof zToBackendCancelQueriesOutput>
>({ value: true });
