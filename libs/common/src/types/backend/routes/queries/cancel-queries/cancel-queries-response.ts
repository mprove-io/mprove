import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCancelQueriesOutput,
  zToBackendCancelQueriesOutput
} from '#common/types/backend/routes/queries/cancel-queries/cancel-queries-output';
import {
  type ToBackendCancelQueriesError,
  zToBackendCancelQueriesError
} from './cancel-queries-error';

export type ToBackendCancelQueriesResponse = ToBackendResponseBase<
  'cancelQueries',
  ToBackendCancelQueriesOutput,
  ToBackendCancelQueriesError
>;

export let zToBackendCancelQueriesResponse = makeToBackendResponseSchema({
  operation: 'cancelQueries',
  output: zToBackendCancelQueriesOutput,
  error: zToBackendCancelQueriesError
}).meta({ id: 'ToBackendCancelQueriesResponse' });

assertTypesEqual<
  ToBackendCancelQueriesResponse,
  z.infer<typeof zToBackendCancelQueriesResponse>
>({ value: true });
