import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type QueryEntToTabError,
  zQueryEntToTabError
} from '#common/types/backend/function-errors/query-ent-to-tab-error';

export type DbQueriesFindFirstError = QueryEntToTabError;

export let zDbQueriesFindFirstError = zQueryEntToTabError;

assertTypesEqual<
  DbQueriesFindFirstError,
  z.infer<typeof zDbQueriesFindFirstError>
>({
  value: true
});
