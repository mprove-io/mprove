import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type GivenEntToTabError = GetTabPropsError;

export let zGivenEntToTabError = zGetTabPropsError;

assertTypesEqual<GivenEntToTabError, z.infer<typeof zGivenEntToTabError>>({
  value: true
});
