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
  type GetLlmModelCheckExistsError,
  zGetLlmModelCheckExistsError
} from '#common/types/backend/function-errors/get-llm-model-check-exists-error';

export type GetModelSelectionError =
  | GetEnabledProviderCheckExistsError
  | GetLlmModelCheckExistsError
  | BackendUserProfileCodexAuthNotSetError
  | BackendProviderApiKeyRequiredError
  | BackendLlmModelNotAvailableInBuilderError
  | BackendLlmModelNotAvailableInExplorerError
  | BackendMessageVariantRequiredError
  | BackendLlmModelVariantNotAvailableError;

export let zGetModelSelectionError = z.union([
  zGetEnabledProviderCheckExistsError,
  zGetLlmModelCheckExistsError,
  zBackendUserProfileCodexAuthNotSetError,
  zBackendProviderApiKeyRequiredError,
  zBackendLlmModelNotAvailableInBuilderError,
  zBackendLlmModelNotAvailableInExplorerError,
  zBackendMessageVariantRequiredError,
  zBackendLlmModelVariantNotAvailableError
]);

assertTypesEqual<
  GetModelSelectionError,
  z.infer<typeof zGetModelSelectionError>
>({ value: true });
