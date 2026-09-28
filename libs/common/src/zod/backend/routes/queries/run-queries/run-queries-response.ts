import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendRunQueriesOutput,
  zToBackendRunQueriesOutput
} from '#common/zod/backend/routes/queries/run-queries/run-queries-output';
import {
  type ToBackendRunQueriesError,
  zToBackendRunQueriesError
} from './run-queries-error';

export type ToBackendRunQueriesResponse = ToBackendResponseBase<
  'runQueries',
  ToBackendRunQueriesOutput,
  ToBackendRunQueriesError
>;

export let zToBackendRunQueriesResponse = makeToBackendResponseSchema({
  operation: 'runQueries',
  output: zToBackendRunQueriesOutput,
  error: zToBackendRunQueriesError
}).meta({ id: 'ToBackendRunQueriesResponse' });

assertTypesEqual<
  ToBackendRunQueriesResponse,
  z.infer<typeof zToBackendRunQueriesResponse>
>({ value: true });
