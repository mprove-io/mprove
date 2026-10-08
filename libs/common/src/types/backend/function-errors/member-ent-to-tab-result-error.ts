import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type MemberEntToTabResultError = GetTabPropsResultError;

export let zMemberEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  MemberEntToTabResultError,
  z.infer<typeof zMemberEntToTabResultError>
>({ value: true });
