import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCodexAuthSignInRequiredError,
  zBackendCodexAuthSignInRequiredError
} from '#common/types/backend/errors/backend-codex-auth-sign-in-required-error';
import {
  type BackendCodexAuthTokenExpiresInIsMissingError,
  zBackendCodexAuthTokenExpiresInIsMissingError
} from '#common/types/backend/errors/backend-codex-auth-token-expires-in-is-missing-error';
import {
  type BackendCodexAuthTokenExpiresInIsTooShortError,
  zBackendCodexAuthTokenExpiresInIsTooShortError
} from '#common/types/backend/errors/backend-codex-auth-token-expires-in-is-too-short-error';
import {
  type BackendEditorSessionLockFailedError,
  zBackendEditorSessionLockFailedError
} from '#common/types/backend/errors/backend-editor-session-lock-failed-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendInteractFailedError,
  zBackendInteractFailedError
} from '#common/types/backend/errors/backend-interact-failed-error';
import {
  type BackendInteractTimeoutError,
  zBackendInteractTimeoutError
} from '#common/types/backend/errors/backend-interact-timeout-error';
import {
  type BackendMessageAgentRequiredError,
  zBackendMessageAgentRequiredError
} from '#common/types/backend/errors/backend-message-agent-required-error';
import {
  type BackendMessageModelRequiredError,
  zBackendMessageModelRequiredError
} from '#common/types/backend/errors/backend-message-model-required-error';
import {
  type BackendMessageProviderRequiredError,
  zBackendMessageProviderRequiredError
} from '#common/types/backend/errors/backend-message-provider-required-error';
import {
  type BackendMessageVariantRequiredError,
  zBackendMessageVariantRequiredError
} from '#common/types/backend/errors/backend-message-variant-required-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendPromptFailedError,
  zBackendPromptFailedError
} from '#common/types/backend/errors/backend-prompt-failed-error';
import {
  type BackendProviderApiKeyRequiredError,
  zBackendProviderApiKeyRequiredError
} from '#common/types/backend/errors/backend-provider-api-key-required-error';
import {
  type BackendProviderDoesNotExistError,
  zBackendProviderDoesNotExistError
} from '#common/types/backend/errors/backend-provider-does-not-exist-error';
import {
  type BackendProviderIsDisabledError,
  zBackendProviderIsDisabledError
} from '#common/types/backend/errors/backend-provider-is-disabled-error';
import {
  type BackendProviderModelDoesNotExistError,
  zBackendProviderModelDoesNotExistError
} from '#common/types/backend/errors/backend-provider-model-does-not-exist-error';
import {
  type BackendProviderModelNotAvailableInBuilderError,
  zBackendProviderModelNotAvailableInBuilderError
} from '#common/types/backend/errors/backend-provider-model-not-available-in-builder-error';
import {
  type BackendProviderModelNotAvailableInExplorerError,
  zBackendProviderModelNotAvailableInExplorerError
} from '#common/types/backend/errors/backend-provider-model-not-available-in-explorer-error';
import {
  type BackendProviderModelVariantNotAvailableError,
  zBackendProviderModelVariantNotAvailableError
} from '#common/types/backend/errors/backend-provider-model-variant-not-available-error';
import {
  type BackendRefetchFromOpencodeFailedError,
  zBackendRefetchFromOpencodeFailedError
} from '#common/types/backend/errors/backend-refetch-from-opencode-failed-error';
import {
  type BackendSandboxHealthCheckFailedError,
  zBackendSandboxHealthCheckFailedError
} from '#common/types/backend/errors/backend-sandbox-health-check-failed-error';
import {
  type BackendSandboxOpencodeRefreshFailedError,
  zBackendSandboxOpencodeRefreshFailedError
} from '#common/types/backend/errors/backend-sandbox-opencode-refresh-failed-error';
import {
  type BackendSchedulerPublishReloadSessionFailedError,
  zBackendSchedulerPublishReloadSessionFailedError
} from '#common/types/backend/errors/backend-scheduler-publish-reload-session-failed-error';
import {
  type BackendSessionIsArchivedError,
  zBackendSessionIsArchivedError
} from '#common/types/backend/errors/backend-session-is-archived-error';
import {
  type BackendSessionIsInErrorStateError,
  zBackendSessionIsInErrorStateError
} from '#common/types/backend/errors/backend-session-is-in-error-state-error';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/types/backend/errors/backend-session-not-found-error';
import {
  type BackendSessionNotReadyError,
  zBackendSessionNotReadyError
} from '#common/types/backend/errors/backend-session-not-ready-error';
import {
  type BackendSessionTypeIsNotEditorError,
  zBackendSessionTypeIsNotEditorError
} from '#common/types/backend/errors/backend-session-type-is-not-editor-error';
import {
  type BackendSseStreamFailedError,
  zBackendSseStreamFailedError
} from '#common/types/backend/errors/backend-sse-stream-failed-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';
import {
  type BackendUnknownSandboxTypeError,
  zBackendUnknownSandboxTypeError
} from '#common/types/backend/errors/backend-unknown-sandbox-type-error';
import {
  type BackendUserProfileCodexAuthNotSetError,
  zBackendUserProfileCodexAuthNotSetError
} from '#common/types/backend/errors/backend-user-profile-codex-auth-not-set-error';

export type ToBackendSendMessageToEditorSessionError =
  | BackendCodexAuthSignInRequiredError
  | BackendCodexAuthTokenExpiresInIsMissingError
  | BackendCodexAuthTokenExpiresInIsTooShortError
  | BackendEditorSessionLockFailedError
  | BackendHashSecretIsNotDefinedError
  | BackendInteractFailedError
  | BackendInteractTimeoutError
  | BackendMessageAgentRequiredError
  | BackendMessageModelRequiredError
  | BackendMessageProviderRequiredError
  | BackendMessageVariantRequiredError
  | BackendProjectDoesNotExistError
  | BackendPromptFailedError
  | BackendProviderApiKeyRequiredError
  | BackendProviderDoesNotExistError
  | BackendProviderIsDisabledError
  | BackendProviderModelDoesNotExistError
  | BackendProviderModelNotAvailableInBuilderError
  | BackendProviderModelNotAvailableInExplorerError
  | BackendProviderModelVariantNotAvailableError
  | BackendRefetchFromOpencodeFailedError
  | BackendSandboxHealthCheckFailedError
  | BackendSandboxOpencodeRefreshFailedError
  | BackendSchedulerPublishReloadSessionFailedError
  | BackendSessionIsArchivedError
  | BackendSessionIsInErrorStateError
  | BackendSessionNotFoundError
  | BackendSessionNotReadyError
  | BackendSessionTypeIsNotEditorError
  | BackendSseStreamFailedError
  | BackendTransactionRetryError
  | BackendUnknownSandboxTypeError
  | BackendUserProfileCodexAuthNotSetError;

export let zToBackendSendMessageToEditorSessionError = z.discriminatedUnion(
  'code',
  [
    zBackendCodexAuthSignInRequiredError,
    zBackendCodexAuthTokenExpiresInIsMissingError,
    zBackendCodexAuthTokenExpiresInIsTooShortError,
    zBackendEditorSessionLockFailedError,
    zBackendHashSecretIsNotDefinedError,
    zBackendInteractFailedError,
    zBackendInteractTimeoutError,
    zBackendMessageAgentRequiredError,
    zBackendMessageModelRequiredError,
    zBackendMessageProviderRequiredError,
    zBackendMessageVariantRequiredError,
    zBackendProjectDoesNotExistError,
    zBackendPromptFailedError,
    zBackendProviderApiKeyRequiredError,
    zBackendProviderDoesNotExistError,
    zBackendProviderIsDisabledError,
    zBackendProviderModelDoesNotExistError,
    zBackendProviderModelNotAvailableInBuilderError,
    zBackendProviderModelNotAvailableInExplorerError,
    zBackendProviderModelVariantNotAvailableError,
    zBackendRefetchFromOpencodeFailedError,
    zBackendSandboxHealthCheckFailedError,
    zBackendSandboxOpencodeRefreshFailedError,
    zBackendSchedulerPublishReloadSessionFailedError,
    zBackendSessionIsArchivedError,
    zBackendSessionIsInErrorStateError,
    zBackendSessionNotFoundError,
    zBackendSessionNotReadyError,
    zBackendSessionTypeIsNotEditorError,
    zBackendSseStreamFailedError,
    zBackendTransactionRetryError,
    zBackendUnknownSandboxTypeError,
    zBackendUserProfileCodexAuthNotSetError
  ]
);

assertTypesEqual<
  ToBackendSendMessageToEditorSessionError,
  z.infer<typeof zToBackendSendMessageToEditorSessionError>
>({ value: true });
