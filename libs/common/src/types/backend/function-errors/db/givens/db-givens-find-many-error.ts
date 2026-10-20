import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GivenEntToTabError,
  zGivenEntToTabError
} from '#common/types/backend/function-errors/given-ent-to-tab-error';

export type DbGivensFindManyError = GivenEntToTabError;

export let zDbGivensFindManyError = zGivenEntToTabError;

assertTypesEqual<DbGivensFindManyError, z.infer<typeof zDbGivensFindManyError>>(
  {
    value: true
  }
);
