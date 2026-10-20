import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ModelEntToTabError,
  zModelEntToTabError
} from '#common/types/backend/function-errors/model-ent-to-tab-error';

export type DbModelsFindManyError = ModelEntToTabError;

export let zDbModelsFindManyError = zModelEntToTabError;

assertTypesEqual<DbModelsFindManyError, z.infer<typeof zDbModelsFindManyError>>(
  {
    value: true
  }
);
