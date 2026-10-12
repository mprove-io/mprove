import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type RoleEntToTabError = GetTabPropsError;

export let zRoleEntToTabError = zGetTabPropsError;

assertTypesEqual<RoleEntToTabError, z.infer<typeof zRoleEntToTabError>>({
  value: true
});
