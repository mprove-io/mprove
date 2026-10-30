import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetUserCheckExistsError,
  zGetUserCheckExistsError
} from '#common/types/backend/function-errors/get-user-check-exists-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type PersistCodexAuthTokensError = GetUserCheckExistsError | WriteError;

export let zPersistCodexAuthTokensError = z.union([
  zGetUserCheckExistsError,
  zWriteError
]);

assertTypesEqual<
  PersistCodexAuthTokensError,
  z.infer<typeof zPersistCodexAuthTokensError>
>({ value: true });
