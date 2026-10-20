import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type AvatarEntToTabError,
  zAvatarEntToTabError
} from '#common/types/backend/function-errors/avatar-ent-to-tab-error';

export type DbAvatarsFindFirstError = AvatarEntToTabError;

export let zDbAvatarsFindFirstError = zAvatarEntToTabError;

assertTypesEqual<
  DbAvatarsFindFirstError,
  z.infer<typeof zDbAvatarsFindFirstError>
>({
  value: true
});
