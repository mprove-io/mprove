import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbUsersFindFirstCheckExistsError,
  zDbUsersFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/users/db-users-find-first-check-exists-error';

export type GetUserCheckExistsError = DbUsersFindFirstCheckExistsError;

export let zGetUserCheckExistsError = zDbUsersFindFirstCheckExistsError;

assertTypesEqual<
  GetUserCheckExistsError,
  z.infer<typeof zGetUserCheckExistsError>
>({ value: true });
