import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';
import {
  type GetSessionByIdCheckExistsError,
  zGetSessionByIdCheckExistsError
} from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import {
  type StopSandboxError,
  zStopSandboxError
} from '#common/types/backend/function-errors/stop-sandbox-error';

export type ArchiveSessionWhileLockedError =
  | GetSessionByIdCheckExistsError
  | StopSandboxError
  | DbErrorToError;

export let zArchiveSessionWhileLockedError = z.union([
  zGetSessionByIdCheckExistsError,
  zStopSandboxError,
  zDbErrorToError
]);

assertTypesEqual<
  ArchiveSessionWhileLockedError,
  z.infer<typeof zArchiveSessionWhileLockedError>
>({ value: true });
