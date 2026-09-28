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
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberIsNotAdminError,
  zBackendMemberIsNotAdminError
} from '#common/zod/backend/errors/backend-member-is-not-admin-error';
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
  type BackendProviderModelAlreadyExistsError,
  zBackendProviderModelAlreadyExistsError
} from '#common/zod/backend/errors/backend-provider-model-already-exists-error';
import {
  type BackendProviderModelContextLimitRequiredError,
  zBackendProviderModelContextLimitRequiredError
} from '#common/zod/backend/errors/backend-provider-model-context-limit-required-error';
import {
  type BackendProviderModelDiscoveryFailedError,
  zBackendProviderModelDiscoveryFailedError
} from '#common/zod/backend/errors/backend-provider-model-discovery-failed-error';
import {
  type BackendProviderModelLimitInvalidError,
  zBackendProviderModelLimitInvalidError
} from '#common/zod/backend/errors/backend-provider-model-limit-invalid-error';
import {
  type BackendProviderModelNotAvailableInBuilderError,
  zBackendProviderModelNotAvailableInBuilderError
} from '#common/zod/backend/errors/backend-provider-model-not-available-in-builder-error';
import {
  type BackendProviderModelNotDiscoveredError,
  zBackendProviderModelNotDiscoveredError
} from '#common/zod/backend/errors/backend-provider-model-not-discovered-error';
import {
  type BackendProviderModelVariantsInvalidError,
  zBackendProviderModelVariantsInvalidError
} from '#common/zod/backend/errors/backend-provider-model-variants-invalid-error';
import {
  type BackendProviderNotValidApiKeyError,
  zBackendProviderNotValidApiKeyError
} from '#common/zod/backend/errors/backend-provider-not-valid-api-key-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';
import {
  type BackendUserProfileCodexAuthNotSetError,
  zBackendUserProfileCodexAuthNotSetError
} from '#common/zod/backend/errors/backend-user-profile-codex-auth-not-set-error';

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
  | BackendProviderModelAlreadyExistsError
  | BackendProviderModelContextLimitRequiredError
  | BackendProviderModelDiscoveryFailedError
  | BackendProviderModelLimitInvalidError
  | BackendProviderModelNotAvailableInBuilderError
  | BackendProviderModelNotDiscoveredError
  | BackendProviderModelVariantsInvalidError
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
  zBackendProviderModelAlreadyExistsError,
  zBackendProviderModelContextLimitRequiredError,
  zBackendProviderModelDiscoveryFailedError,
  zBackendProviderModelLimitInvalidError,
  zBackendProviderModelNotAvailableInBuilderError,
  zBackendProviderModelNotDiscoveredError,
  zBackendProviderModelVariantsInvalidError,
  zBackendProviderNotValidApiKeyError,
  zBackendTransactionRetryError,
  zBackendUserProfileCodexAuthNotSetError
]);

assertTypesEqual<
  ToBackendCreateLlmModelError,
  z.infer<typeof zToBackendCreateLlmModelError>
>({ value: true });
