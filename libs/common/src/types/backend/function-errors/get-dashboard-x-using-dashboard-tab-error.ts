import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbMconfigsFindManyError,
  zDbMconfigsFindManyError
} from '#common/types/backend/function-errors/db/mconfigs/db-mconfigs-find-many-error';
import {
  type DbModelsFindManyError,
  zDbModelsFindManyError
} from '#common/types/backend/function-errors/db/models/db-models-find-many-error';
import {
  type DbQueriesFindManyError,
  zDbQueriesFindManyError
} from '#common/types/backend/function-errors/db/queries/db-queries-find-many-error';

export type GetDashboardXUsingDashboardTabError =
  | DbMconfigsFindManyError
  | DbQueriesFindManyError
  | DbModelsFindManyError;

export const zGetDashboardXUsingDashboardTabError = z.union([
  zDbMconfigsFindManyError,
  zDbQueriesFindManyError,
  zDbModelsFindManyError
]);

assertTypesEqual<
  GetDashboardXUsingDashboardTabError,
  z.infer<typeof zGetDashboardXUsingDashboardTabError>
>({ value: true });
