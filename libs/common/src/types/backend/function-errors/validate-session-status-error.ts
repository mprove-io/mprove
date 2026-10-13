import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendSessionIsArchivedError,
  zBackendSessionIsArchivedError
} from '#common/types/backend/errors/backend-session-is-archived-error';
import {
  type BackendSessionIsInErrorStateError,
  zBackendSessionIsInErrorStateError
} from '#common/types/backend/errors/backend-session-is-in-error-state-error';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/types/backend/errors/backend-session-not-found-error';
import {
  type BackendSessionNotReadyError,
  zBackendSessionNotReadyError
} from '#common/types/backend/errors/backend-session-not-ready-error';

export type ValidateSessionStatusError =
  | BackendSessionNotReadyError
  | BackendSessionIsArchivedError
  | BackendSessionNotFoundError
  | BackendSessionIsInErrorStateError;

export let zValidateSessionStatusError = z.union([
  zBackendSessionNotReadyError,
  zBackendSessionIsArchivedError,
  zBackendSessionNotFoundError,
  zBackendSessionIsInErrorStateError
]);

assertTypesEqual<
  ValidateSessionStatusError,
  z.infer<typeof zValidateSessionStatusError>
>({ value: true });
