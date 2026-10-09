import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProviderEntToTabResultError,
  zProviderEntToTabResultError
} from '#common/types/backend/function-errors/provider-ent-to-tab-result-error';

export type GetEnabledProvidersResultError = ProviderEntToTabResultError;

export const zGetEnabledProvidersResultError = zProviderEntToTabResultError;

assertTypesEqual<
  GetEnabledProvidersResultError,
  z.infer<typeof zGetEnabledProvidersResultError>
>({ value: true });
