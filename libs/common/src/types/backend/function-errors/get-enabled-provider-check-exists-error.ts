import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendProviderIsDisabledError,
  zBackendProviderIsDisabledError
} from '#common/types/backend/errors/backend-provider-is-disabled-error';
import {
  type GetProviderCheckExistsError,
  zGetProviderCheckExistsError
} from '#common/types/backend/function-errors/get-provider-check-exists-error';

export type GetEnabledProviderCheckExistsError =
  | GetProviderCheckExistsError
  | BackendProviderIsDisabledError;

export let zGetEnabledProviderCheckExistsError = z.union([
  zGetProviderCheckExistsError,
  zBackendProviderIsDisabledError
]);

assertTypesEqual<
  GetEnabledProviderCheckExistsError,
  z.infer<typeof zGetEnabledProviderCheckExistsError>
>({ value: true });
