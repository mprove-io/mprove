import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type ModelEntToTabResultError = GetTabPropsResultError;

export let zModelEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  ModelEntToTabResultError,
  z.infer<typeof zModelEntToTabResultError>
>({ value: true });
