import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type StructEntToTabError,
  zStructEntToTabError
} from '#common/types/backend/function-errors/struct-ent-to-tab-error';

export type DbStructsFindManyError = StructEntToTabError;

export let zDbStructsFindManyError = zStructEntToTabError;

assertTypesEqual<
  DbStructsFindManyError,
  z.infer<typeof zDbStructsFindManyError>
>({
  value: true
});
