import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type UserEntToTabResultError = GetTabPropsResultError;

export let zUserEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  UserEntToTabResultError,
  z.infer<typeof zUserEntToTabResultError>
>({ value: true });
