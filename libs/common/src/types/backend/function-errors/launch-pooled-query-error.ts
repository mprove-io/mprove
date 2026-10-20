import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetQueryExecutionContextError,
  zGetQueryExecutionContextError
} from '#common/types/backend/function-errors/get-query-execution-context-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type LaunchPooledQueryError = WriteError | GetQueryExecutionContextError;

export let zLaunchPooledQueryError = z.union([
  zWriteError,
  zGetQueryExecutionContextError
]);

assertTypesEqual<
  LaunchPooledQueryError,
  z.infer<typeof zLaunchPooledQueryError>
>({ value: true });
