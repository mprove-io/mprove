import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Query, zQuery } from '#common/types/blockml/parts/query';

export type ToBackendGetQueriesOutput = {
  queries: Query[];
};

export let zToBackendGetQueriesOutput = z
  .object({
    queries: z.array(zQuery)
  })
  .meta({ id: 'ToBackendGetQueriesOutput' });

assertTypesEqual<
  ToBackendGetQueriesOutput,
  z.infer<typeof zToBackendGetQueriesOutput>
>({ value: true });
