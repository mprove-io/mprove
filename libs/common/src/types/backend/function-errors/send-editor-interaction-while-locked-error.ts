import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbSessionsFindFirstCheckExistsError,
  zDbSessionsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';
import {
  type DispatchEditorInteractionError,
  zDispatchEditorInteractionError
} from '#common/types/backend/function-errors/dispatch-editor-interaction-error';
import {
  type GetUserCheckExistsError,
  zGetUserCheckExistsError
} from '#common/types/backend/function-errors/get-user-check-exists-error';
import {
  type PrepareEditorSandboxError,
  zPrepareEditorSandboxError
} from '#common/types/backend/function-errors/prepare-editor-sandbox-error';
import {
  type PrewarmCodexAuthError,
  zPrewarmCodexAuthError
} from '#common/types/backend/function-errors/prewarm-codex-auth-error';
import {
  type SaveSessionError,
  zSaveSessionError
} from '#common/types/backend/function-errors/save-session-error';
import {
  type ValidateSessionStatusError,
  zValidateSessionStatusError
} from '#common/types/backend/function-errors/validate-session-status-error';

export type SendEditorInteractionWhileLockedError =
  | DbSessionsFindFirstCheckExistsError
  | ValidateSessionStatusError
  | PrewarmCodexAuthError
  | GetUserCheckExistsError
  | PrepareEditorSandboxError
  | DispatchEditorInteractionError
  | SaveSessionError;

export let zSendEditorInteractionWhileLockedError = z.union([
  zDbSessionsFindFirstCheckExistsError,
  zValidateSessionStatusError,
  zPrewarmCodexAuthError,
  zGetUserCheckExistsError,
  zPrepareEditorSandboxError,
  zDispatchEditorInteractionError,
  zSaveSessionError
]);

assertTypesEqual<
  SendEditorInteractionWhileLockedError,
  z.infer<typeof zSendEditorInteractionWhileLockedError>
>({ value: true });
