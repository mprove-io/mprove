import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SelectedGivenValue,
  zSelectedGivenValue
} from '#common/types/backend/parts/selected-given-value';

export type AppliedGivenValue = SelectedGivenValue | { defaultText: string };

export let zAppliedGivenValue = z.union([
  zSelectedGivenValue,
  z.object({ defaultText: z.string() })
]);

assertTypesEqual<AppliedGivenValue, z.infer<typeof zAppliedGivenValue>>({
  value: true
});
