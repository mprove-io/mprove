import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type RoleEntToTabResultError = GetTabPropsResultError;

export let zRoleEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  RoleEntToTabResultError,
  z.infer<typeof zRoleEntToTabResultError>
>({ value: true });
