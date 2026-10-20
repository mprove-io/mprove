import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type AvatarEntToTabError,
  zAvatarEntToTabError
} from '#common/types/backend/function-errors/avatar-ent-to-tab-error';

export type DbAvatarsFindManyError = AvatarEntToTabError;

export let zDbAvatarsFindManyError = zAvatarEntToTabError;

assertTypesEqual<
  DbAvatarsFindManyError,
  z.infer<typeof zDbAvatarsFindManyError>
>({
  value: true
});
