import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type OcEventEntToTabError = GetTabPropsError;

export let zOcEventEntToTabError = zGetTabPropsError;

assertTypesEqual<OcEventEntToTabError, z.infer<typeof zOcEventEntToTabError>>({
  value: true
});
