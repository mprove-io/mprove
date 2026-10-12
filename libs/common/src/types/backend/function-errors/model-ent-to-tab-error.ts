import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type ModelEntToTabError = GetTabPropsError;

export let zModelEntToTabError = zGetTabPropsError;

assertTypesEqual<ModelEntToTabError, z.infer<typeof zModelEntToTabError>>({
  value: true
});
