import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendLlmModelNotAvailableInBuilderError,
  zBackendLlmModelNotAvailableInBuilderError
} from '#common/types/backend/errors/backend-llm-model-not-available-in-builder-error';
import {
  type BackendLlmModelNotAvailableInExplorerError,
  zBackendLlmModelNotAvailableInExplorerError
} from '#common/types/backend/errors/backend-llm-model-not-available-in-explorer-error';
import {
  type BackendLlmModelVariantNotAvailableError,
  zBackendLlmModelVariantNotAvailableError
} from '#common/types/backend/errors/backend-llm-model-variant-not-available-error';
import {
  type BackendMessageVariantRequiredError,
  zBackendMessageVariantRequiredError
} from '#common/types/backend/errors/backend-message-variant-required-error';
import {
  type BackendProviderApiKeyRequiredError,
  zBackendProviderApiKeyRequiredError
} from '#common/types/backend/errors/backend-provider-api-key-required-error';
import {
  type BackendUserProfileCodexAuthNotSetError,
  zBackendUserProfileCodexAuthNotSetError
} from '#common/types/backend/errors/backend-user-profile-codex-auth-not-set-error';
import {
  type GetEnabledProviderCheckExistsError,
  zGetEnabledProviderCheckExistsError
} from '#common/types/backend/function-errors/get-enabled-provider-check-exists-error';
import {
  type GetProviderModelCheckExistsError,
  zGetProviderModelCheckExistsError
} from '#common/types/backend/function-errors/get-provider-model-check-exists-error';

export type GetProviderModelSelectionError =
  | GetEnabledProviderCheckExistsError
  | GetProviderModelCheckExistsError
  | BackendUserProfileCodexAuthNotSetError
  | BackendProviderApiKeyRequiredError
  | BackendLlmModelNotAvailableInBuilderError
  | BackendLlmModelNotAvailableInExplorerError
  | BackendMessageVariantRequiredError
  | BackendLlmModelVariantNotAvailableError;

export let zGetProviderModelSelectionError = z.union([
  zGetEnabledProviderCheckExistsError,
  zGetProviderModelCheckExistsError,
  zBackendUserProfileCodexAuthNotSetError,
  zBackendProviderApiKeyRequiredError,
  zBackendLlmModelNotAvailableInBuilderError,
  zBackendLlmModelNotAvailableInExplorerError,
  zBackendMessageVariantRequiredError,
  zBackendLlmModelVariantNotAvailableError
]);

assertTypesEqual<
  GetProviderModelSelectionError,
  z.infer<typeof zGetProviderModelSelectionError>
>({ value: true });
