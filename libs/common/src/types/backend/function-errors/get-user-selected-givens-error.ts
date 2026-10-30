import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SelectUserUnselectedGivensError,
  zSelectUserUnselectedGivensError
} from '#common/types/backend/function-errors/select-user-unselected-givens-error';

export type GetUserSelectedGivensError = SelectUserUnselectedGivensError;

export const zGetUserSelectedGivensError = zSelectUserUnselectedGivensError;

assertTypesEqual<
  GetUserSelectedGivensError,
  z.infer<typeof zGetUserSelectedGivensError>
>({ value: true });
