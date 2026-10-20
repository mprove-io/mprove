import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db/db-error-to-error';
import {
  type DbSessionsFindFirstCheckExistsError,
  zDbSessionsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';
import {
  type SendToDiskError,
  zSendToDiskError
} from '#common/types/backend/function-errors/send-to-disk-error';
import {
  type StopSandboxError,
  zStopSandboxError
} from '#common/types/backend/function-errors/stop-sandbox-error';

export type DeleteWhileLockedError =
  | DbSessionsFindFirstCheckExistsError
  | StopSandboxError
  | SendToDiskError
  | DbErrorToError;

export let zDeleteWhileLockedError = z.union([
  zDbSessionsFindFirstCheckExistsError,
  zStopSandboxError,
  zSendToDiskError,
  zDbErrorToError
]);

assertTypesEqual<
  DeleteWhileLockedError,
  z.infer<typeof zDeleteWhileLockedError>
>({ value: true });
