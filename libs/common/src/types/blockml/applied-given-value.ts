import { z } from 'zod';
import { zSelectedGivenValue } from '#common/types/backend/selected-given-value';

export let zAppliedGivenValue = z.union([
  zSelectedGivenValue,
  z.object({ defaultText: z.string() })
]);

export type AppliedGivenValue = z.infer<typeof zAppliedGivenValue>;
