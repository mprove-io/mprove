import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type StructEntToTabError,
  zStructEntToTabError
} from '#common/types/backend/function-errors/struct-ent-to-tab-error';

export type DbStructsFindFirstError = StructEntToTabError;

export let zDbStructsFindFirstError = zStructEntToTabError;

assertTypesEqual<
  DbStructsFindFirstError,
  z.infer<typeof zDbStructsFindFirstError>
>({
  value: true
});
