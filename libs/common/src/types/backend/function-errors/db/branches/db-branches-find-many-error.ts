import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BranchEntToTabError,
  zBranchEntToTabError
} from '#common/types/backend/function-errors/branch-ent-to-tab-error';

export type DbBranchesFindManyError = BranchEntToTabError;

export let zDbBranchesFindManyError = zBranchEntToTabError;

assertTypesEqual<
  DbBranchesFindManyError,
  z.infer<typeof zDbBranchesFindManyError>
>({
  value: true
});
