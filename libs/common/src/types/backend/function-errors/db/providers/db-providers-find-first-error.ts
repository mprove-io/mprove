import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProviderEntToTabError,
  zProviderEntToTabError
} from '#common/types/backend/function-errors/provider-ent-to-tab-error';

export type DbProvidersFindFirstError = ProviderEntToTabError;

export let zDbProvidersFindFirstError = zProviderEntToTabError;

assertTypesEqual<
  DbProvidersFindFirstError,
  z.infer<typeof zDbProvidersFindFirstError>
>({
  value: true
});
