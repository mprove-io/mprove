import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type KitEntToTabError = GetTabPropsError;

export const zKitEntToTabError = zGetTabPropsError;

assertTypesEqual<KitEntToTabError, z.infer<typeof zKitEntToTabError>>({
  value: true
});
