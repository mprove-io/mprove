import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProviderEntToTabError,
  zProviderEntToTabError
} from '#common/types/backend/function-errors/provider-ent-to-tab-error';

export type GetEnabledProvidersError = ProviderEntToTabError;

export const zGetEnabledProvidersError = zProviderEntToTabError;

assertTypesEqual<
  GetEnabledProvidersError,
  z.infer<typeof zGetEnabledProvidersError>
>({ value: true });
