import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type QueryEstimate,
  zQueryEstimate
} from '#common/zod/backend/query-estimate';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type Query, zQuery } from '#common/zod/blockml/query';
import {
  type ToBackendRunQueriesDryError,
  zToBackendRunQueriesDryError
} from './run-queries-dry-error';

export type ToBackendRunQueriesDryOutput = {
  dryId: string;
  validQueryEstimates: QueryEstimate[];
  errorQueries: Query[];
};

export type ToBackendRunQueriesDryResponse = ToBackendResponse<
  ToBackendRunQueriesDryOutput,
  ToBackendRunQueriesDryError
>;

export let zToBackendRunQueriesDryOutput = z
  .object({
    dryId: z.string(),
    validQueryEstimates: z.array(zQueryEstimate),
    errorQueries: z.array(zQuery)
  })
  .meta({ id: 'ToBackendRunQueriesDryOutput' });

export let zToBackendRunQueriesDryResponse = makeToBackendResponseSchema({
  success: zToBackendRunQueriesDryOutput,
  error: zToBackendRunQueriesDryError
}).meta({ id: 'ToBackendRunQueriesDryResponse' });

assertTypesEqual<
  ToBackendRunQueriesDryOutput,
  z.infer<typeof zToBackendRunQueriesDryOutput>
>({ value: true });

assertTypesEqual<
  ToBackendRunQueriesDryResponse,
  z.infer<typeof zToBackendRunQueriesDryResponse>
>({ value: true });
