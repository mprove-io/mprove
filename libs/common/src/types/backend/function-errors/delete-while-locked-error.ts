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
  type SendToDiskError,
  zSendToDiskError
} from '#common/types/backend/function-errors/send-to-disk-error';
import {
  type StopSandboxError,
  zStopSandboxError
} from '#common/types/backend/function-errors/stop-sandbox-error';

export type DeleteWhileLockedError =
  | GetSessionByIdCheckExistsError
  | StopSandboxError
  | SendToDiskError
  | DbErrorToError;

export let zDeleteWhileLockedError = z.union([
  zGetSessionByIdCheckExistsError,
  zStopSandboxError,
  zSendToDiskError,
  zDbErrorToError
]);

assertTypesEqual<
  DeleteWhileLockedError,
  z.infer<typeof zDeleteWhileLockedError>
>({ value: true });
