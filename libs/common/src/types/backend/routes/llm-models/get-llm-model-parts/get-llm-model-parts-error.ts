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
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendLlmModelDiscoveryFailedError,
  zBackendLlmModelDiscoveryFailedError
} from '#common/types/backend/errors/backend-llm-model-discovery-failed-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/types/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberIsNotAdminError,
  zBackendMemberIsNotAdminError
} from '#common/types/backend/errors/backend-member-is-not-admin-error';
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
  type BackendProviderNotValidApiKeyError,
  zBackendProviderNotValidApiKeyError
} from '#common/types/backend/errors/backend-provider-not-valid-api-key-error';
import {
  type BackendProviderTypeMismatchError,
  zBackendProviderTypeMismatchError
} from '#common/types/backend/errors/backend-provider-type-mismatch-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';
import {
  type BackendUserProfileCodexAuthNotSetError,
  zBackendUserProfileCodexAuthNotSetError
} from '#common/types/backend/errors/backend-user-profile-codex-auth-not-set-error';

export type ToBackendGetLlmModelPartsError =
  | BackendCodexAuthSignInRequiredError
  | BackendCodexAuthTokenExpiresInIsMissingError
  | BackendCodexAuthTokenExpiresInIsTooShortError
  | BackendHashSecretIsNotDefinedError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotAdminError
  | BackendProjectDoesNotExistError
  | BackendPromptFailedError
  | BackendProviderApiKeyRequiredError
  | BackendProviderDoesNotExistError
  | BackendLlmModelDiscoveryFailedError
  | BackendProviderNotValidApiKeyError
  | BackendProviderTypeMismatchError
  | BackendTransactionRetryError
  | BackendUserProfileCodexAuthNotSetError;

export let zToBackendGetLlmModelPartsError = z.discriminatedUnion('code', [
  zBackendCodexAuthSignInRequiredError,
  zBackendCodexAuthTokenExpiresInIsMissingError,
  zBackendCodexAuthTokenExpiresInIsTooShortError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotAdminError,
  zBackendProjectDoesNotExistError,
  zBackendPromptFailedError,
  zBackendProviderApiKeyRequiredError,
  zBackendProviderDoesNotExistError,
  zBackendLlmModelDiscoveryFailedError,
  zBackendProviderNotValidApiKeyError,
  zBackendProviderTypeMismatchError,
  zBackendTransactionRetryError,
  zBackendUserProfileCodexAuthNotSetError
]);

assertTypesEqual<
  ToBackendGetLlmModelPartsError,
  z.infer<typeof zToBackendGetLlmModelPartsError>
>({ value: true });
