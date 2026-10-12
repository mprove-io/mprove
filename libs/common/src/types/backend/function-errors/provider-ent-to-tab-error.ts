import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type ProviderEntToTabError = GetTabPropsError;

export const zProviderEntToTabError = zGetTabPropsError;

assertTypesEqual<ProviderEntToTabError, z.infer<typeof zProviderEntToTabError>>(
  { value: true }
);
