import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type UconfigEntToTabError,
  zUconfigEntToTabError
} from '#common/types/backend/function-errors/uconfig-ent-to-tab-error';

export type DbUconfigsFindManyError = UconfigEntToTabError;

export let zDbUconfigsFindManyError = zUconfigEntToTabError;

assertTypesEqual<
  DbUconfigsFindManyError,
  z.infer<typeof zDbUconfigsFindManyError>
>({
  value: true
});
