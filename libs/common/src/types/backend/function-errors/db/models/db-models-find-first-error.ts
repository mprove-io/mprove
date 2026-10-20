import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ModelEntToTabError,
  zModelEntToTabError
} from '#common/types/backend/function-errors/model-ent-to-tab-error';

export type DbModelsFindFirstError = ModelEntToTabError;

export let zDbModelsFindFirstError = zModelEntToTabError;

assertTypesEqual<
  DbModelsFindFirstError,
  z.infer<typeof zDbModelsFindFirstError>
>({
  value: true
});
