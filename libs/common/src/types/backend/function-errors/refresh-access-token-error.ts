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

export type RefreshAccessTokenError =
  | BackendCodexAuthSignInRequiredError
  | BackendPromptFailedError;

export let zRefreshAccessTokenError = z.union([
  zBackendCodexAuthSignInRequiredError,
  zBackendPromptFailedError
]);

assertTypesEqual<
  RefreshAccessTokenError,
  z.infer<typeof zRefreshAccessTokenError>
>({ value: true });
