import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetConnectionSampleError,
  zToBackendGetConnectionSampleError
} from './get-connection-sample-error';

export type ToBackendGetConnectionSampleOutput = {
  columnNames: string[];
  rows: string[][];
  errorMessage?: string;
};

export type ToBackendGetConnectionSampleResponse = ToBackendResponse<
  ToBackendGetConnectionSampleOutput,
  ToBackendGetConnectionSampleError
>;

export let zToBackendGetConnectionSampleOutput = z
  .object({
    columnNames: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'ToBackendGetConnectionSampleOutput' });

export let zToBackendGetConnectionSampleResponse = makeToBackendResponseSchema({
  success: zToBackendGetConnectionSampleOutput,
  error: zToBackendGetConnectionSampleError
}).meta({ id: 'ToBackendGetConnectionSampleResponse' });

assertTypesEqual<
  ToBackendGetConnectionSampleOutput,
  z.infer<typeof zToBackendGetConnectionSampleOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetConnectionSampleResponse,
  z.infer<typeof zToBackendGetConnectionSampleResponse>
>({ value: true });
