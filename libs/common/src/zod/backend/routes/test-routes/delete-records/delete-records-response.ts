import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteRecordsOutput,
  zToBackendDeleteRecordsOutput
} from '#common/zod/backend/routes/test-routes/delete-records/delete-records-output';
import {
  type ToBackendDeleteRecordsError,
  zToBackendDeleteRecordsError
} from './delete-records-error';

export type ToBackendDeleteRecordsResponse = ToBackendResponseBase<
  'deleteRecords',
  ToBackendDeleteRecordsOutput,
  ToBackendDeleteRecordsError
>;

export let zToBackendDeleteRecordsResponse = makeToBackendResponseSchema({
  operation: 'deleteRecords',
  output: zToBackendDeleteRecordsOutput,
  error: zToBackendDeleteRecordsError
}).meta({ id: 'ToBackendDeleteRecordsResponse' });

assertTypesEqual<
  ToBackendDeleteRecordsResponse,
  z.infer<typeof zToBackendDeleteRecordsResponse>
>({ value: true });
