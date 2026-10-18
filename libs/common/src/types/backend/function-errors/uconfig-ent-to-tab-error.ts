import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type UconfigEntToTabError = GetTabPropsError;

export let zUconfigEntToTabError = zGetTabPropsError;

assertTypesEqual<UconfigEntToTabError, z.infer<typeof zUconfigEntToTabError>>({
  value: true
});
