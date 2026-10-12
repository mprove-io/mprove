import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type CachedPartEntToTabError = GetTabPropsError;

export let zCachedPartEntToTabError = zGetTabPropsError;

assertTypesEqual<
  CachedPartEntToTabError,
  z.infer<typeof zCachedPartEntToTabError>
>({ value: true });
