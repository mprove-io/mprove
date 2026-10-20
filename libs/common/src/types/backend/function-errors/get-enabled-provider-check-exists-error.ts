import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendProviderIsDisabledError,
  zBackendProviderIsDisabledError
} from '#common/types/backend/errors/backend-provider-is-disabled-error';
import {
  type DbProvidersFindFirstCheckExistsError,
  zDbProvidersFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/providers/db-providers-find-first-check-exists-error';

export type GetEnabledProviderCheckExistsError =
  | DbProvidersFindFirstCheckExistsError
  | BackendProviderIsDisabledError;

export let zGetEnabledProviderCheckExistsError = z.union([
  zDbProvidersFindFirstCheckExistsError,
  zBackendProviderIsDisabledError
]);

assertTypesEqual<
  GetEnabledProviderCheckExistsError,
  z.infer<typeof zGetEnabledProviderCheckExistsError>
>({ value: true });
