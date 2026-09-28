import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCodexAuthSignInRequiredError,
  zBackendCodexAuthSignInRequiredError
} from '#common/zod/backend/errors/backend-codex-auth-sign-in-required-error';
import {
  type BackendCodexAuthTokenExpiresInIsMissingError,
  zBackendCodexAuthTokenExpiresInIsMissingError
} from '#common/zod/backend/errors/backend-codex-auth-token-expires-in-is-missing-error';
import {
  type BackendCodexAuthTokenExpiresInIsTooShortError,
  zBackendCodexAuthTokenExpiresInIsTooShortError
} from '#common/zod/backend/errors/backend-codex-auth-token-expires-in-is-too-short-error';
import {
  type BackendCreateSessionFailedError,
  zBackendCreateSessionFailedError
} from '#common/zod/backend/errors/backend-create-session-failed-error';
import {
  type BackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromBlockmlError
} from '#common/zod/backend/errors/backend-error-response-from-blockml-error';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/zod/backend/errors/backend-error-response-from-disk-error';
import {
  type BackendFailedToGetInitialCommitError,
  zBackendFailedToGetInitialCommitError
} from '#common/zod/backend/errors/backend-failed-to-get-initial-commit-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberIsNotEditorError,
  zBackendMemberIsNotEditorError
} from '#common/zod/backend/errors/backend-member-is-not-editor-error';
import {
  type BackendMessageVariantRequiredError,
  zBackendMessageVariantRequiredError
} from '#common/zod/backend/errors/backend-message-variant-required-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/zod/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendPromptFailedError,
  zBackendPromptFailedError
} from '#common/zod/backend/errors/backend-prompt-failed-error';
import {
  type BackendProviderApiKeyRequiredError,
  zBackendProviderApiKeyRequiredError
} from '#common/zod/backend/errors/backend-provider-api-key-required-error';
import {
  type BackendProviderDoesNotExistError,
  zBackendProviderDoesNotExistError
} from '#common/zod/backend/errors/backend-provider-does-not-exist-error';
import {
  type BackendProviderIsDisabledError,
  zBackendProviderIsDisabledError
} from '#common/zod/backend/errors/backend-provider-is-disabled-error';
import {
  type BackendProviderModelDoesNotExistError,
  zBackendProviderModelDoesNotExistError
} from '#common/zod/backend/errors/backend-provider-model-does-not-exist-error';
import {
  type BackendProviderModelNotAvailableInBuilderError,
  zBackendProviderModelNotAvailableInBuilderError
} from '#common/zod/backend/errors/backend-provider-model-not-available-in-builder-error';
import {
  type BackendProviderModelNotAvailableInExplorerError,
  zBackendProviderModelNotAvailableInExplorerError
} from '#common/zod/backend/errors/backend-provider-model-not-available-in-explorer-error';
import {
  type BackendProviderModelVariantNotAvailableError,
  zBackendProviderModelVariantNotAvailableError
} from '#common/zod/backend/errors/backend-provider-model-variant-not-available-error';
import {
  type BackendRefetchFromOpencodeFailedError,
  zBackendRefetchFromOpencodeFailedError
} from '#common/zod/backend/errors/backend-refetch-from-opencode-failed-error';
import {
  type BackendRpcInvalidResponseFormatError,
  zBackendRpcInvalidResponseFormatError
} from '#common/zod/backend/errors/backend-rpc-invalid-response-format-error';
import {
  type BackendRpcTimeoutError,
  zBackendRpcTimeoutError
} from '#common/zod/backend/errors/backend-rpc-timeout-error';
import {
  type BackendSandboxCreateFailedError,
  zBackendSandboxCreateFailedError
} from '#common/zod/backend/errors/backend-sandbox-create-failed-error';
import {
  type BackendSandboxGitCheckoutFailedError,
  zBackendSandboxGitCheckoutFailedError
} from '#common/zod/backend/errors/backend-sandbox-git-checkout-failed-error';
import {
  type BackendSandboxGitCloneFailedError,
  zBackendSandboxGitCloneFailedError
} from '#common/zod/backend/errors/backend-sandbox-git-clone-failed-error';
import {
  type BackendSandboxHealthCheckFailedError,
  zBackendSandboxHealthCheckFailedError
} from '#common/zod/backend/errors/backend-sandbox-health-check-failed-error';
import {
  type BackendSchedulerPublishReloadSessionFailedError,
  zBackendSchedulerPublishReloadSessionFailedError
} from '#common/zod/backend/errors/backend-scheduler-publish-reload-session-failed-error';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/zod/backend/errors/backend-session-not-found-error';
import {
  type BackendSseStreamFailedError,
  zBackendSseStreamFailedError
} from '#common/zod/backend/errors/backend-sse-stream-failed-error';
import {
  type BackendTooManyActiveEditorSessionsError,
  zBackendTooManyActiveEditorSessionsError
} from '#common/zod/backend/errors/backend-too-many-active-editor-sessions-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';
import {
  type BackendUnknownSandboxTypeError,
  zBackendUnknownSandboxTypeError
} from '#common/zod/backend/errors/backend-unknown-sandbox-type-error';
import {
  type BackendUserProfileCodexAuthNotSetError,
  zBackendUserProfileCodexAuthNotSetError
} from '#common/zod/backend/errors/backend-user-profile-codex-auth-not-set-error';
import {
  type BackendWrongTotalDiskShardsError,
  zBackendWrongTotalDiskShardsError
} from '#common/zod/backend/errors/backend-wrong-total-disk-shards-error';

export type ToBackendCreateEditorSessionError =
  | BackendCodexAuthSignInRequiredError
  | BackendCodexAuthTokenExpiresInIsMissingError
  | BackendCodexAuthTokenExpiresInIsTooShortError
  | BackendCreateSessionFailedError
  | BackendErrorResponseFromBlockmlError
  | BackendErrorResponseFromDiskError
  | BackendFailedToGetInitialCommitError
  | BackendHashSecretIsNotDefinedError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotEditorError
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
  | BackendRpcInvalidResponseFormatError
  | BackendRpcTimeoutError
  | BackendSandboxCreateFailedError
  | BackendSandboxGitCheckoutFailedError
  | BackendSandboxGitCloneFailedError
  | BackendSandboxHealthCheckFailedError
  | BackendSchedulerPublishReloadSessionFailedError
  | BackendSessionNotFoundError
  | BackendSseStreamFailedError
  | BackendTooManyActiveEditorSessionsError
  | BackendTransactionRetryError
  | BackendUnknownSandboxTypeError
  | BackendUserProfileCodexAuthNotSetError
  | BackendWrongTotalDiskShardsError;

export let zToBackendCreateEditorSessionError = z.discriminatedUnion('code', [
  zBackendCodexAuthSignInRequiredError,
  zBackendCodexAuthTokenExpiresInIsMissingError,
  zBackendCodexAuthTokenExpiresInIsTooShortError,
  zBackendCreateSessionFailedError,
  zBackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromDiskError,
  zBackendFailedToGetInitialCommitError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotEditorError,
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
  zBackendRpcInvalidResponseFormatError,
  zBackendRpcTimeoutError,
  zBackendSandboxCreateFailedError,
  zBackendSandboxGitCheckoutFailedError,
  zBackendSandboxGitCloneFailedError,
  zBackendSandboxHealthCheckFailedError,
  zBackendSchedulerPublishReloadSessionFailedError,
  zBackendSessionNotFoundError,
  zBackendSseStreamFailedError,
  zBackendTooManyActiveEditorSessionsError,
  zBackendTransactionRetryError,
  zBackendUnknownSandboxTypeError,
  zBackendUserProfileCodexAuthNotSetError,
  zBackendWrongTotalDiskShardsError
]);

assertTypesEqual<
  ToBackendCreateEditorSessionError,
  z.infer<typeof zToBackendCreateEditorSessionError>
>({ value: true });
