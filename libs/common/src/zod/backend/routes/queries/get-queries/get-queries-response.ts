import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type Query, zQuery } from '#common/zod/blockml/query';
import {
  type ToBackendGetQueriesError,
  zToBackendGetQueriesError
} from './get-queries-error';

export type ToBackendGetQueriesOutput = {
  queries: Query[];
};

export type ToBackendGetQueriesResponse = ToBackendResponse<
  ToBackendGetQueriesOutput,
  ToBackendGetQueriesError
>;

export let zToBackendGetQueriesOutput = z
  .object({
    queries: z.array(zQuery)
  })
  .meta({ id: 'ToBackendGetQueriesOutput' });

export let zToBackendGetQueriesResponse = makeToBackendResponseSchema({
  success: zToBackendGetQueriesOutput,
  error: zToBackendGetQueriesError
}).meta({ id: 'ToBackendGetQueriesResponse' });

assertTypesEqual<
  ToBackendGetQueriesOutput,
  z.infer<typeof zToBackendGetQueriesOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetQueriesResponse,
  z.infer<typeof zToBackendGetQueriesResponse>
>({ value: true });
