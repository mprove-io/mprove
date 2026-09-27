import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type Query, zQuery } from '#common/zod/blockml/query';
import {
  type ToBackendRunQueriesError,
  zToBackendRunQueriesError
} from './run-queries-error';

export type ToBackendRunQueriesOutput = {
  runningQueries: Query[];
  startedQueryIds: string[];
};

export type ToBackendRunQueriesResponse = ToBackendResponse<
  ToBackendRunQueriesOutput,
  ToBackendRunQueriesError
>;

export let zToBackendRunQueriesOutput = z
  .object({
    runningQueries: z.array(zQuery),
    startedQueryIds: z.array(z.string())
  })
  .meta({ id: 'ToBackendRunQueriesOutput' });

export let zToBackendRunQueriesResponse = makeToBackendResponseSchema({
  success: zToBackendRunQueriesOutput,
  error: zToBackendRunQueriesError
}).meta({ id: 'ToBackendRunQueriesResponse' });

assertTypesEqual<
  ToBackendRunQueriesOutput,
  z.infer<typeof zToBackendRunQueriesOutput>
>({ value: true });

assertTypesEqual<
  ToBackendRunQueriesResponse,
  z.infer<typeof zToBackendRunQueriesResponse>
>({ value: true });
