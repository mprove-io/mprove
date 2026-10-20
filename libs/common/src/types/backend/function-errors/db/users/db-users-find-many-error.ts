import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type UserEntToTabError,
  zUserEntToTabError
} from '#common/types/backend/function-errors/user-ent-to-tab-error';

export type DbUsersFindManyError = UserEntToTabError;

export let zDbUsersFindManyError = zUserEntToTabError;

assertTypesEqual<DbUsersFindManyError, z.infer<typeof zDbUsersFindManyError>>({
  value: true
});
