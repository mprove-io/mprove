import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type CachedColumnEntToTabError = GetTabPropsError;

export let zCachedColumnEntToTabError = zGetTabPropsError;

assertTypesEqual<
  CachedColumnEntToTabError,
  z.infer<typeof zCachedColumnEntToTabError>
>({ value: true });
