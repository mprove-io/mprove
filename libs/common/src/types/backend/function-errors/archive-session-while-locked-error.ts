import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbSessionsFindFirstCheckExistsError,
  zDbSessionsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';
import {
  type StopSandboxError,
  zStopSandboxError
} from '#common/types/backend/function-errors/stop-sandbox-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type ArchiveSessionWhileLockedError =
  | DbSessionsFindFirstCheckExistsError
  | StopSandboxError
  | WriteError;

export let zArchiveSessionWhileLockedError = z.union([
  zDbSessionsFindFirstCheckExistsError,
  zStopSandboxError,
  zWriteError
]);

assertTypesEqual<
  ArchiveSessionWhileLockedError,
  z.infer<typeof zArchiveSessionWhileLockedError>
>({ value: true });
