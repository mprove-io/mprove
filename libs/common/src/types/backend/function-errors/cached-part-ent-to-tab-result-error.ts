import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type CachedPartEntToTabResultError = GetTabPropsResultError;

export let zCachedPartEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  CachedPartEntToTabResultError,
  z.infer<typeof zCachedPartEntToTabResultError>
>({ value: true });
