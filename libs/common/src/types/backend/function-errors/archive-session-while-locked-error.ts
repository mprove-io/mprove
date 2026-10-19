import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetSessionByIdCheckExistsError,
  zGetSessionByIdCheckExistsError
} from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import {
  type StopSandboxError,
  zStopSandboxError
} from '#common/types/backend/function-errors/stop-sandbox-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type ArchiveSessionWhileLockedError =
  | GetSessionByIdCheckExistsError
  | StopSandboxError
  | WriteError;

export let zArchiveSessionWhileLockedError = z.union([
  zGetSessionByIdCheckExistsError,
  zStopSandboxError,
  zWriteError
]);

assertTypesEqual<
  ArchiveSessionWhileLockedError,
  z.infer<typeof zArchiveSessionWhileLockedError>
>({ value: true });
