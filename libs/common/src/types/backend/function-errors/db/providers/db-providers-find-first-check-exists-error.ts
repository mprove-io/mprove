import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendProviderDoesNotExistError,
  zBackendProviderDoesNotExistError
} from '#common/types/backend/errors/backend-provider-does-not-exist-error';
import {
  type ProviderEntToTabError,
  zProviderEntToTabError
} from '#common/types/backend/function-errors/provider-ent-to-tab-error';

export type DbProvidersFindFirstCheckExistsError =
  | ProviderEntToTabError
  | BackendProviderDoesNotExistError;

export let zDbProvidersFindFirstCheckExistsError = z.union([
  zProviderEntToTabError,
  zBackendProviderDoesNotExistError
]);

assertTypesEqual<
  DbProvidersFindFirstCheckExistsError,
  z.infer<typeof zDbProvidersFindFirstCheckExistsError>
>({
  value: true
});
