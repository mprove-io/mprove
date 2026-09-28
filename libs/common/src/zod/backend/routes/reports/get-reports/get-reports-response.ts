import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetReportsOutput,
  zToBackendGetReportsOutput
} from '#common/zod/backend/routes/reports/get-reports/get-reports-output';
import {
  type ToBackendGetReportsError,
  zToBackendGetReportsError
} from './get-reports-error';

export type ToBackendGetReportsResponse = ToBackendResponseBase<
  'getReports',
  ToBackendGetReportsOutput,
  ToBackendGetReportsError
>;

export let zToBackendGetReportsResponse = makeToBackendResponseSchema({
  operation: 'getReports',
  output: zToBackendGetReportsOutput,
  error: zToBackendGetReportsError
}).meta({ id: 'ToBackendGetReportsResponse' });

assertTypesEqual<
  ToBackendGetReportsResponse,
  z.infer<typeof zToBackendGetReportsResponse>
>({ value: true });
