import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type Query, zQuery } from '#common/zod/blockml/query';
import {
  type ToBackendCancelQueriesError,
  zToBackendCancelQueriesError
} from './cancel-queries-error';

export type ToBackendCancelQueriesOutput = {
  queries: Query[];
};

export type ToBackendCancelQueriesResponse = ToBackendResponse<
  ToBackendCancelQueriesOutput,
  ToBackendCancelQueriesError
>;

export let zToBackendCancelQueriesOutput = z
  .object({
    queries: z.array(zQuery)
  })
  .meta({ id: 'ToBackendCancelQueriesOutput' });

export let zToBackendCancelQueriesResponse = makeToBackendResponseSchema({
  success: zToBackendCancelQueriesOutput,
  error: zToBackendCancelQueriesError
}).meta({ id: 'ToBackendCancelQueriesResponse' });

assertTypesEqual<
  ToBackendCancelQueriesOutput,
  z.infer<typeof zToBackendCancelQueriesOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCancelQueriesResponse,
  z.infer<typeof zToBackendCancelQueriesResponse>
>({ value: true });
