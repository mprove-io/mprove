import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbSessionsFindFirstCheckExistsError,
  zDbSessionsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';
import {
  type PauseSessionByIdError,
  zPauseSessionByIdError
} from '#common/types/backend/function-errors/pause-session-by-id-error';

export type PauseWhileLockedError =
  | DbSessionsFindFirstCheckExistsError
  | PauseSessionByIdError;

export let zPauseWhileLockedError = z.union([
  zDbSessionsFindFirstCheckExistsError,
  zPauseSessionByIdError
]);

assertTypesEqual<PauseWhileLockedError, z.infer<typeof zPauseWhileLockedError>>(
  { value: true }
);
