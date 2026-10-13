import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';
import {
  type GetProjectCheckExistsError,
  zGetProjectCheckExistsError
} from '#common/types/backend/function-errors/get-project-check-exists-error';
import {
  type GetSessionByIdCheckExistsError,
  zGetSessionByIdCheckExistsError
} from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import {
  type PauseSandboxError,
  zPauseSandboxError
} from '#common/types/backend/function-errors/pause-sandbox-error';

export type PauseSessionByIdError =
  | GetSessionByIdCheckExistsError
  | GetProjectCheckExistsError
  | PauseSandboxError
  | DbErrorToError;

export let zPauseSessionByIdError = z.union([
  zGetSessionByIdCheckExistsError,
  zGetProjectCheckExistsError,
  zPauseSandboxError,
  zDbErrorToError
]);

assertTypesEqual<PauseSessionByIdError, z.infer<typeof zPauseSessionByIdError>>(
  { value: true }
);
