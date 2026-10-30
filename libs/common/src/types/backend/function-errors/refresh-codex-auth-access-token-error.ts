import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCodexAuthSignInRequiredError,
  zBackendCodexAuthSignInRequiredError
} from '#common/types/backend/errors/backend-codex-auth-sign-in-required-error';
import {
  type BackendPromptFailedError,
  zBackendPromptFailedError
} from '#common/types/backend/errors/backend-prompt-failed-error';

export type RefreshCodexAuthAccessTokenError =
  | BackendCodexAuthSignInRequiredError
  | BackendPromptFailedError;

export let zRefreshCodexAuthAccessTokenError = z.union([
  zBackendCodexAuthSignInRequiredError,
  zBackendPromptFailedError
]);

assertTypesEqual<
  RefreshCodexAuthAccessTokenError,
  z.infer<typeof zRefreshCodexAuthAccessTokenError>
>({ value: true });
