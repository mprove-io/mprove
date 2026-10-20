import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BranchEntToTabError,
  zBranchEntToTabError
} from '#common/types/backend/function-errors/branch-ent-to-tab-error';

export type DbBranchesFindFirstError = BranchEntToTabError;

export let zDbBranchesFindFirstError = zBranchEntToTabError;

assertTypesEqual<
  DbBranchesFindFirstError,
  z.infer<typeof zDbBranchesFindFirstError>
>({
  value: true
});
