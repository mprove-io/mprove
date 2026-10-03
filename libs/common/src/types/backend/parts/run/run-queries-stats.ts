import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type RunQueriesStats = {
  started: number;
  running: number;
  completed: number;
  error: number;
  canceled: number;
};

export let zRunQueriesStats = z
  .object({
    started: z.number().int(),
    running: z.number().int(),
    completed: z.number().int(),
    error: z.number().int(),
    canceled: z.number().int()
  })
  .meta({ id: 'RunQueriesStats' });

assertTypesEqual<RunQueriesStats, z.infer<typeof zRunQueriesStats>>({
  value: true
});
