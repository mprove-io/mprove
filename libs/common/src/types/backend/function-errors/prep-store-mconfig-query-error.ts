import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbConnectionsFindFirstError,
  zDbConnectionsFindFirstError
} from '#common/types/backend/function-errors/db/connections/db-connections-find-first-error';
import {
  type GetApiEnvsError,
  zGetApiEnvsError
} from '#common/types/backend/function-errors/get-api-envs-error';

export type PrepStoreMconfigQueryError =
  | GetApiEnvsError
  | DbConnectionsFindFirstError;

export const zPrepStoreMconfigQueryError = z.union([
  zGetApiEnvsError,
  zDbConnectionsFindFirstError
]);

assertTypesEqual<
  PrepStoreMconfigQueryError,
  z.infer<typeof zPrepStoreMconfigQueryError>
>({ value: true });
