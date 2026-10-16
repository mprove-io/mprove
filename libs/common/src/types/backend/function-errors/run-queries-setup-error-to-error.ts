import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { zDbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import { zGetQueryExecutionContextError } from '#common/types/backend/function-errors/get-query-execution-context-error';
import type { LaunchPooledQueryError } from '#common/types/backend/function-errors/launch-pooled-query-error';
import type { RunPooledQueryError } from '#common/types/backend/function-errors/run-pooled-query-error';

export type RunQueriesSetupErrorToError =
  | RunPooledQueryError
  | LaunchPooledQueryError;

export const zRunQueriesSetupErrorToError = z.union([
  zDbErrorToError,
  zGetQueryExecutionContextError
]);

assertTypesEqual<
  RunQueriesSetupErrorToError,
  z.infer<typeof zRunQueriesSetupErrorToError>
>({ value: true });
