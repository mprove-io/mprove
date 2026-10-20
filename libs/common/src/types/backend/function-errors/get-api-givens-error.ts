import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbGivensFindManyError,
  zDbGivensFindManyError
} from '#common/types/backend/function-errors/db/givens/db-givens-find-many-error';

export type GetApiGivensError = DbGivensFindManyError;

export let zGetApiGivensError = zDbGivensFindManyError;

assertTypesEqual<GetApiGivensError, z.infer<typeof zGetApiGivensError>>({
  value: true
});
