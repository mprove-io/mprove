import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetQueriesOutput,
  zToBackendGetQueriesOutput
} from '#common/types/backend/routes/queries/get-queries/get-queries-output';
import {
  type ToBackendGetQueriesError,
  zToBackendGetQueriesError
} from './get-queries-error';

export type ToBackendGetQueriesResponse = ToBackendResponseBase<
  'getQueries',
  ToBackendGetQueriesOutput,
  ToBackendGetQueriesError
>;

export let zToBackendGetQueriesResponse = makeToBackendResponseSchema({
  operation: 'getQueries',
  output: zToBackendGetQueriesOutput,
  error: zToBackendGetQueriesError
}).meta({ id: 'ToBackendGetQueriesResponse' });

assertTypesEqual<
  ToBackendGetQueriesResponse,
  z.infer<typeof zToBackendGetQueriesResponse>
>({ value: true });
