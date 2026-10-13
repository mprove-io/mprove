import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetSessionByIdCheckExistsError,
  zGetSessionByIdCheckExistsError
} from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import {
  type PauseSessionByIdError,
  zPauseSessionByIdError
} from '#common/types/backend/function-errors/pause-session-by-id-error';

export type PauseWhileLockedError =
  | GetSessionByIdCheckExistsError
  | PauseSessionByIdError;

export let zPauseWhileLockedError = z.union([
  zGetSessionByIdCheckExistsError,
  zPauseSessionByIdError
]);

assertTypesEqual<PauseWhileLockedError, z.infer<typeof zPauseWhileLockedError>>(
  { value: true }
);
