import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type ProjectEntToTabError = GetTabPropsError;

export let zProjectEntToTabError = zGetTabPropsError;

assertTypesEqual<ProjectEntToTabError, z.infer<typeof zProjectEntToTabError>>({
  value: true
});
