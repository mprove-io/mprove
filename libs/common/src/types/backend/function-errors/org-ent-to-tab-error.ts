import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type OrgEntToTabError = GetTabPropsError;

export let zOrgEntToTabError = zGetTabPropsError;

assertTypesEqual<OrgEntToTabError, z.infer<typeof zOrgEntToTabError>>({
  value: true
});
