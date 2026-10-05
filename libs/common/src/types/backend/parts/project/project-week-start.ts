import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const projectWeekStartValues = ['Sunday', 'Monday'] as const;

export type ProjectWeekStart = (typeof projectWeekStartValues)[number];

export let zProjectWeekStart = z.enum(projectWeekStartValues);

assertTypesEqual<ProjectWeekStart, z.infer<typeof zProjectWeekStart>>({
  value: true
});
