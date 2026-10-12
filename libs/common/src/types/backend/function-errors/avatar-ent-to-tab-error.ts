import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type AvatarEntToTabError = GetTabPropsError;

export let zAvatarEntToTabError = zGetTabPropsError;

assertTypesEqual<AvatarEntToTabError, z.infer<typeof zAvatarEntToTabError>>({
  value: true
});
