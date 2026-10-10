import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToResultError,
  zDbErrorToResultError
} from '#common/types/backend/function-errors/db-error-to-result-error';
import {
  type GetSessionByIdCheckExistsResultError,
  zGetSessionByIdCheckExistsResultError
} from '#common/types/backend/function-errors/get-session-by-id-check-exists-result-error';
import {
  type StopSandboxResultError,
  zStopSandboxResultError
} from '#common/types/backend/function-errors/stop-sandbox-result-error';

export type ArchiveSessionWhileLockedResultError =
  | GetSessionByIdCheckExistsResultError
  | StopSandboxResultError
  | DbErrorToResultError;

export let zArchiveSessionWhileLockedResultError = z.union([
  zGetSessionByIdCheckExistsResultError,
  zStopSandboxResultError,
  zDbErrorToResultError
]);

assertTypesEqual<
  ArchiveSessionWhileLockedResultError,
  z.infer<typeof zArchiveSessionWhileLockedResultError>
>({ value: true });
