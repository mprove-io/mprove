import type { BackendProviderDoesNotExistError } from '#common/types/backend/errors/backend-provider-does-not-exist-error';
import type { ProviderEntToTabResultError } from '#common/types/backend/function-errors/provider-ent-to-tab-result-error';

export type GetProviderCheckExistsResultError =
  | BackendProviderDoesNotExistError
  | ProviderEntToTabResultError;
