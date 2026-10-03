import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type QueryEstimate = {
  queryId: string;
  estimate: number;
  lastRunDryTs: number;
};

export let zQueryEstimate = z
  .object({
    queryId: z.string(),
    estimate: z.number().int(),
    lastRunDryTs: z.number()
  })
  .meta({ id: 'QueryEstimate' });

assertTypesEqual<QueryEstimate, z.infer<typeof zQueryEstimate>>({
  value: true
});
