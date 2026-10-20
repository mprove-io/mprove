import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbProvidersFindManyError,
  zDbProvidersFindManyError
} from '#common/types/backend/function-errors/db/providers/db-providers-find-many-error';
import {
  type DbSessionsFindFirstCheckExistsError,
  zDbSessionsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';
import {
  type GetOpenCodeClientError,
  zGetOpenCodeClientError
} from '#common/types/backend/function-errors/get-open-code-client-error';
import {
  type HealthCheckOpenCodeError,
  zHealthCheckOpenCodeError
} from '#common/types/backend/function-errors/health-check-open-code-error';
import {
  type RestartOpencodeServerError,
  zRestartOpencodeServerError
} from '#common/types/backend/function-errors/restart-opencode-server-error';
import {
  type ResumeSandboxError,
  zResumeSandboxError
} from '#common/types/backend/function-errors/resume-sandbox-error';
import {
  type SaveSessionError,
  zSaveSessionError
} from '#common/types/backend/function-errors/save-session-error';

export type PrepareEditorSandboxError =
  | ResumeSandboxError
  | DbProvidersFindManyError
  | DbSessionsFindFirstCheckExistsError
  | RestartOpencodeServerError
  | SaveSessionError
  | GetOpenCodeClientError
  | HealthCheckOpenCodeError;

export let zPrepareEditorSandboxError = z.union([
  zResumeSandboxError,
  zDbProvidersFindManyError,
  zDbSessionsFindFirstCheckExistsError,
  zRestartOpencodeServerError,
  zSaveSessionError,
  zGetOpenCodeClientError,
  zHealthCheckOpenCodeError
]);

assertTypesEqual<
  PrepareEditorSandboxError,
  z.infer<typeof zPrepareEditorSandboxError>
>({ value: true });
