import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type UserEntToTabError = GetTabPropsError;

export let zUserEntToTabError = zGetTabPropsError;

assertTypesEqual<UserEntToTabError, z.infer<typeof zUserEntToTabError>>({
  value: true
});
