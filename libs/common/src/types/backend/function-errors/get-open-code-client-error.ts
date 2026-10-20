import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbSessionsFindFirstCheckExistsError,
  zDbSessionsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';

export type GetOpenCodeClientError = DbSessionsFindFirstCheckExistsError;

export let zGetOpenCodeClientError = zDbSessionsFindFirstCheckExistsError;

assertTypesEqual<
  GetOpenCodeClientError,
  z.infer<typeof zGetOpenCodeClientError>
>({ value: true });
