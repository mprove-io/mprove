import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendSeedRecordsOutput,
  zToBackendSeedRecordsOutput
} from '#common/types/backend/routes/test-routes/seed-records/seed-records-output';
import {
  type ToBackendSeedRecordsError,
  zToBackendSeedRecordsError
} from './seed-records-error';

export type ToBackendSeedRecordsResponse = ToBackendResponseBase<
  'seedRecords',
  ToBackendSeedRecordsOutput,
  ToBackendSeedRecordsError
>;

export let zToBackendSeedRecordsResponse = makeToBackendResponseSchema({
  operation: 'seedRecords',
  output: zToBackendSeedRecordsOutput,
  error: zToBackendSeedRecordsError
}).meta({ id: 'ToBackendSeedRecordsResponse' });

assertTypesEqual<
  ToBackendSeedRecordsResponse,
  z.infer<typeof zToBackendSeedRecordsResponse>
>({ value: true });
