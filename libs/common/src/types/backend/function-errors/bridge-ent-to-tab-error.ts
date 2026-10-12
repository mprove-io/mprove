import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type BridgeEntToTabError = GetTabPropsError;

export let zBridgeEntToTabError = zGetTabPropsError;

assertTypesEqual<BridgeEntToTabError, z.infer<typeof zBridgeEntToTabError>>({
  value: true
});
