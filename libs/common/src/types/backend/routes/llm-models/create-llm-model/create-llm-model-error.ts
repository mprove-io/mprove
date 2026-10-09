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
  type BackendLlmModelAlreadyExistsError,
  zBackendLlmModelAlreadyExistsError
} from '#common/types/backend/errors/backend-llm-model-already-exists-error';
import {
  type BackendLlmModelContextLimitRequiredError,
  zBackendLlmModelContextLimitRequiredError
} from '#common/types/backend/errors/backend-llm-model-context-limit-required-error';
import {
  type BackendLlmModelDiscoveryFailedError,
  zBackendLlmModelDiscoveryFailedError
} from '#common/types/backend/errors/backend-llm-model-discovery-failed-error';
import {
  type BackendLlmModelLimitInvalidError,
  zBackendLlmModelLimitInvalidError
} from '#common/types/backend/errors/backend-llm-model-limit-invalid-error';
import {
  type BackendLlmModelNotAvailableInBuilderError,
  zBackendLlmModelNotAvailableInBuilderError
} from '#common/types/backend/errors/backend-llm-model-not-available-in-builder-error';
import {
  type BackendLlmModelNotDiscoveredError,
  zBackendLlmModelNotDiscoveredError
} from '#common/types/backend/errors/backend-llm-model-not-discovered-error';
import {
  type BackendLlmModelVariantsInvalidError,
  zBackendLlmModelVariantsInvalidError
} from '#common/types/backend/errors/backend-llm-model-variants-invalid-error';
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
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';
import {
  type BackendUserProfileCodexAuthNotSetError,
  zBackendUserProfileCodexAuthNotSetError
} from '#common/types/backend/errors/backend-user-profile-codex-auth-not-set-error';

export type ToBackendCreateLlmModelError =
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
  | BackendLlmModelAlreadyExistsError
  | BackendLlmModelContextLimitRequiredError
  | BackendLlmModelDiscoveryFailedError
  | BackendLlmModelLimitInvalidError
  | BackendLlmModelNotAvailableInBuilderError
  | BackendLlmModelNotDiscoveredError
  | BackendLlmModelVariantsInvalidError
  | BackendProviderNotValidApiKeyError
  | BackendTransactionRetryError
  | BackendUserProfileCodexAuthNotSetError;

export let zToBackendCreateLlmModelError = z.discriminatedUnion('code', [
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
  zBackendLlmModelAlreadyExistsError,
  zBackendLlmModelContextLimitRequiredError,
  zBackendLlmModelDiscoveryFailedError,
  zBackendLlmModelLimitInvalidError,
  zBackendLlmModelNotAvailableInBuilderError,
  zBackendLlmModelNotDiscoveredError,
  zBackendLlmModelVariantsInvalidError,
  zBackendProviderNotValidApiKeyError,
  zBackendTransactionRetryError,
  zBackendUserProfileCodexAuthNotSetError
]);

assertTypesEqual<
  ToBackendCreateLlmModelError,
  z.infer<typeof zToBackendCreateLlmModelError>
>({ value: true });
