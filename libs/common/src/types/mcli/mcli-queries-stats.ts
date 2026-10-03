import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type McliQueriesStats = {
  started: number;
  running: number;
  completed: number;
  error: number;
  canceled: number;
};

export let zMcliQueriesStats = z
  .object({
    started: z.number(),
    running: z.number(),
    completed: z.number(),
    error: z.number(),
    canceled: z.number()
  })
  .meta({ id: 'McliQueriesStats' });

assertTypesEqual<McliQueriesStats, z.infer<typeof zMcliQueriesStats>>({
  value: true
});
