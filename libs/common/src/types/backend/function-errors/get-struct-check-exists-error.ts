import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbStructsFindFirstCheckExistsError,
  zDbStructsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/structs/db-structs-find-first-check-exists-error';

export type GetStructCheckExistsError = DbStructsFindFirstCheckExistsError;

export let zGetStructCheckExistsError = zDbStructsFindFirstCheckExistsError;

assertTypesEqual<
  GetStructCheckExistsError,
  z.infer<typeof zGetStructCheckExistsError>
>({ value: true });
