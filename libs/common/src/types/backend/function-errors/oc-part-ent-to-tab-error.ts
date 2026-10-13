import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type OcPartEntToTabError = GetTabPropsError;

export let zOcPartEntToTabError = zGetTabPropsError;

assertTypesEqual<OcPartEntToTabError, z.infer<typeof zOcPartEntToTabError>>({
  value: true
});
