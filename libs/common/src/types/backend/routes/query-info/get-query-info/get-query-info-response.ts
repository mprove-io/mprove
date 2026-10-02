import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetQueryInfoOutput,
  zToBackendGetQueryInfoOutput
} from '#common/types/backend/routes/query-info/get-query-info/get-query-info-output';
import {
  type ToBackendGetQueryInfoError,
  zToBackendGetQueryInfoError
} from './get-query-info-error';

export type ToBackendGetQueryInfoResponse = ToBackendResponseBase<
  'getQueryInfo',
  ToBackendGetQueryInfoOutput,
  ToBackendGetQueryInfoError
>;

export let zToBackendGetQueryInfoResponse = makeToBackendResponseSchema({
  operation: 'getQueryInfo',
  output: zToBackendGetQueryInfoOutput,
  error: zToBackendGetQueryInfoError
}).meta({ id: 'ToBackendGetQueryInfoResponse' });

assertTypesEqual<
  ToBackendGetQueryInfoResponse,
  z.infer<typeof zToBackendGetQueryInfoResponse>
>({ value: true });
