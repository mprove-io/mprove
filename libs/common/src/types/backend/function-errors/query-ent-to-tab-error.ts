import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type QueryEntToTabError = GetTabPropsError;

export let zQueryEntToTabError = zGetTabPropsError;

assertTypesEqual<QueryEntToTabError, z.infer<typeof zQueryEntToTabError>>({
  value: true
});
