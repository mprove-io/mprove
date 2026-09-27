import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteRecordsError,
  zToBackendDeleteRecordsError
} from './delete-records-error';

export type ToBackendDeleteRecordsOutput = Record<string, never>;

export type ToBackendDeleteRecordsResponse = ToBackendResponse<
  ToBackendDeleteRecordsOutput,
  ToBackendDeleteRecordsError
>;

export let zToBackendDeleteRecordsOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteRecordsOutput' });

export let zToBackendDeleteRecordsResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteRecordsOutput,
  error: zToBackendDeleteRecordsError
}).meta({ id: 'ToBackendDeleteRecordsResponse' });

assertTypesEqual<
  ToBackendDeleteRecordsOutput,
  z.infer<typeof zToBackendDeleteRecordsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteRecordsResponse,
  z.infer<typeof zToBackendDeleteRecordsResponse>
>({ value: true });
