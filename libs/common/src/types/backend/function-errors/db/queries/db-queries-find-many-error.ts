import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type QueryEntToTabError,
  zQueryEntToTabError
} from '#common/types/backend/function-errors/query-ent-to-tab-error';

export type DbQueriesFindManyError = QueryEntToTabError;

export let zDbQueriesFindManyError = zQueryEntToTabError;

assertTypesEqual<
  DbQueriesFindManyError,
  z.infer<typeof zDbQueriesFindManyError>
>({
  value: true
});
