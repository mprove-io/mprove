import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type Query, zQuery } from '#common/zod/blockml/query';
import {
  type ToBackendGetQueryError,
  zToBackendGetQueryError
} from './get-query-error';

export type ToBackendGetQueryOutput = {
  query: Query;
};

export type ToBackendGetQueryResponse = ToBackendResponse<
  ToBackendGetQueryOutput,
  ToBackendGetQueryError
>;

export let zToBackendGetQueryOutput = z
  .object({
    query: zQuery
  })
  .meta({ id: 'ToBackendGetQueryOutput' });

export let zToBackendGetQueryResponse = makeToBackendResponseSchema({
  success: zToBackendGetQueryOutput,
  error: zToBackendGetQueryError
}).meta({ id: 'ToBackendGetQueryResponse' });

assertTypesEqual<
  ToBackendGetQueryOutput,
  z.infer<typeof zToBackendGetQueryOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetQueryResponse,
  z.infer<typeof zToBackendGetQueryResponse>
>({ value: true });
