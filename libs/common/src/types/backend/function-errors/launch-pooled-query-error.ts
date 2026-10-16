import type { GetQueryExecutionContextError } from '#common/types/backend/function-errors/get-query-execution-context-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';

export type LaunchPooledQueryError = WriteError | GetQueryExecutionContextError;
