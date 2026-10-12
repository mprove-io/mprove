import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type MconfigEntToTabError = GetTabPropsError;

export let zMconfigEntToTabError = zGetTabPropsError;

assertTypesEqual<MconfigEntToTabError, z.infer<typeof zMconfigEntToTabError>>({
  value: true
});
