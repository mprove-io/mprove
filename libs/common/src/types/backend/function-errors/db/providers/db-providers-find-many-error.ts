import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProviderEntToTabError,
  zProviderEntToTabError
} from '#common/types/backend/function-errors/provider-ent-to-tab-error';

export type DbProvidersFindManyError = ProviderEntToTabError;

export let zDbProvidersFindManyError = zProviderEntToTabError;

assertTypesEqual<
  DbProvidersFindManyError,
  z.infer<typeof zDbProvidersFindManyError>
>({
  value: true
});
