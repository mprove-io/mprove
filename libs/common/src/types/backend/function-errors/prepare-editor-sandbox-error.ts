import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetEnabledProvidersError,
  zGetEnabledProvidersError
} from '#common/types/backend/function-errors/get-enabled-providers-error';
import {
  type GetOpenCodeClientError,
  zGetOpenCodeClientError
} from '#common/types/backend/function-errors/get-open-code-client-error';
import {
  type GetSessionByIdCheckExistsError,
  zGetSessionByIdCheckExistsError
} from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
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
  | GetEnabledProvidersError
  | GetSessionByIdCheckExistsError
  | RestartOpencodeServerError
  | SaveSessionError
  | GetOpenCodeClientError
  | HealthCheckOpenCodeError;

export let zPrepareEditorSandboxError = z.union([
  zResumeSandboxError,
  zGetEnabledProvidersError,
  zGetSessionByIdCheckExistsError,
  zRestartOpencodeServerError,
  zSaveSessionError,
  zGetOpenCodeClientError,
  zHealthCheckOpenCodeError
]);

assertTypesEqual<
  PrepareEditorSandboxError,
  z.infer<typeof zPrepareEditorSandboxError>
>({ value: true });
