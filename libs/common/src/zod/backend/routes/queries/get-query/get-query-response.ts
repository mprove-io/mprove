import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetQueryOutput,
  zToBackendGetQueryOutput
} from '#common/zod/backend/routes/queries/get-query/get-query-output';
import {
  type ToBackendGetQueryError,
  zToBackendGetQueryError
} from './get-query-error';

export type ToBackendGetQueryResponse = ToBackendResponseBase<
  'getQuery',
  ToBackendGetQueryOutput,
  ToBackendGetQueryError
>;

export let zToBackendGetQueryResponse = makeToBackendResponseSchema({
  operation: 'getQuery',
  output: zToBackendGetQueryOutput,
  error: zToBackendGetQueryError
}).meta({ id: 'ToBackendGetQueryResponse' });

assertTypesEqual<
  ToBackendGetQueryResponse,
  z.infer<typeof zToBackendGetQueryResponse>
>({ value: true });
