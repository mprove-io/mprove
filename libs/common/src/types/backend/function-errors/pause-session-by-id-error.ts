import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db/db-error-to-error';
import {
  type DbProjectsFindFirstCheckExistsError,
  zDbProjectsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/projects/db-projects-find-first-check-exists-error';
import {
  type DbSessionsFindFirstCheckExistsError,
  zDbSessionsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';
import {
  type PauseSandboxError,
  zPauseSandboxError
} from '#common/types/backend/function-errors/pause-sandbox-error';

export type PauseSessionByIdError =
  | DbSessionsFindFirstCheckExistsError
  | DbProjectsFindFirstCheckExistsError
  | PauseSandboxError
  | DbErrorToError;

export let zPauseSessionByIdError = z.union([
  zDbSessionsFindFirstCheckExistsError,
  zDbProjectsFindFirstCheckExistsError,
  zPauseSandboxError,
  zDbErrorToError
]);

assertTypesEqual<PauseSessionByIdError, z.infer<typeof zPauseSessionByIdError>>(
  { value: true }
);
