import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type MemberEntToTabError = GetTabPropsError;

export let zMemberEntToTabError = zGetTabPropsError;

assertTypesEqual<MemberEntToTabError, z.infer<typeof zMemberEntToTabError>>({
  value: true
});
