import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendSeedRecordsError,
  zToBackendSeedRecordsError
} from './seed-records-error';

export type ToBackendSeedRecordsOutput = Record<string, never>;

export type ToBackendSeedRecordsResponse = ToBackendResponse<
  ToBackendSeedRecordsOutput,
  ToBackendSeedRecordsError
>;

export let zToBackendSeedRecordsOutput = z
  .object({})
  .meta({ id: 'ToBackendSeedRecordsOutput' });

export let zToBackendSeedRecordsResponse = makeToBackendResponseSchema({
  success: zToBackendSeedRecordsOutput,
  error: zToBackendSeedRecordsError
}).meta({ id: 'ToBackendSeedRecordsResponse' });

assertTypesEqual<
  ToBackendSeedRecordsOutput,
  z.infer<typeof zToBackendSeedRecordsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSeedRecordsResponse,
  z.infer<typeof zToBackendSeedRecordsResponse>
>({ value: true });
