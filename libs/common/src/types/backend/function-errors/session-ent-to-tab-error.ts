import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type SessionEntToTabError = GetTabPropsError;

export let zSessionEntToTabError = zGetTabPropsError;

assertTypesEqual<SessionEntToTabError, z.infer<typeof zSessionEntToTabError>>({
  value: true
});
