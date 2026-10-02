import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Query, zQuery } from '#common/types/blockml/parts/query';

export type ToBackendRunQueriesOutput = {
  runningQueries: Query[];
  startedQueryIds: string[];
};

export let zToBackendRunQueriesOutput = z
  .object({
    runningQueries: z.array(zQuery),
    startedQueryIds: z.array(z.string())
  })
  .meta({ id: 'ToBackendRunQueriesOutput' });

assertTypesEqual<
  ToBackendRunQueriesOutput,
  z.infer<typeof zToBackendRunQueriesOutput>
>({ value: true });
