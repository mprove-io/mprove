import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type CachedColumnEntToTabResultError = GetTabPropsResultError;

export let zCachedColumnEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  CachedColumnEntToTabResultError,
  z.infer<typeof zCachedColumnEntToTabResultError>
>({ value: true });
