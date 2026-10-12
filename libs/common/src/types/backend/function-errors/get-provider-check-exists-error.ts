import type { BackendProviderDoesNotExistError } from '#common/types/backend/errors/backend-provider-does-not-exist-error';
import type { ProviderEntToTabError } from '#common/types/backend/function-errors/provider-ent-to-tab-error';

export type GetProviderCheckExistsError =
  | BackendProviderDoesNotExistError
  | ProviderEntToTabError;
