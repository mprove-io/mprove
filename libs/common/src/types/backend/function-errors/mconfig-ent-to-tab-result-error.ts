import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type MconfigEntToTabResultError = GetTabPropsResultError;

export let zMconfigEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  MconfigEntToTabResultError,
  z.infer<typeof zMconfigEntToTabResultError>
>({ value: true });
