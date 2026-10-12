import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type BranchEntToTabError = GetTabPropsError;

export let zBranchEntToTabError = zGetTabPropsError;

assertTypesEqual<BranchEntToTabError, z.infer<typeof zBranchEntToTabError>>({
  value: true
});
