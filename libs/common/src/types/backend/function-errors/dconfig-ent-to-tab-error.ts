import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type DconfigEntToTabError = GetTabPropsError;

export let zDconfigEntToTabError = zGetTabPropsError;

assertTypesEqual<DconfigEntToTabError, z.infer<typeof zDconfigEntToTabError>>({
  value: true
});
