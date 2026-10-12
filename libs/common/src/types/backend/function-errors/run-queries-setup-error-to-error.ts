import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';
import {
  type GetApiEnvsError,
  zGetApiEnvsError
} from '#common/types/backend/function-errors/get-api-envs-error';
import {
  type GetConnectionCheckExistsError,
  zGetConnectionCheckExistsError
} from '#common/types/backend/function-errors/get-connection-check-exists-error';
import {
  type GetMemberCheckExistsError,
  zGetMemberCheckExistsError
} from '#common/types/backend/function-errors/get-member-check-exists-error';
import {
  type GetQueryCheckExistsSkipDataError,
  zGetQueryCheckExistsSkipDataError
} from '#common/types/backend/function-errors/get-query-check-exists-skip-data-error';

export type RunQueriesSetupErrorToError =
  | DbErrorToError
  | GetApiEnvsError
  | GetConnectionCheckExistsError
  | GetMemberCheckExistsError
  | GetQueryCheckExistsSkipDataError;

export const zRunQueriesSetupErrorToError = z.union([
  zDbErrorToError,
  zGetApiEnvsError,
  zGetConnectionCheckExistsError,
  zGetMemberCheckExistsError,
  zGetQueryCheckExistsSkipDataError
]);

assertTypesEqual<
  RunQueriesSetupErrorToError,
  z.infer<typeof zRunQueriesSetupErrorToError>
>({ value: true });
