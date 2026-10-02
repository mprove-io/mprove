import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetReportOutput,
  zToBackendGetReportOutput
} from '#common/types/backend/routes/reports/get-report/get-report-output';
import {
  type ToBackendGetReportError,
  zToBackendGetReportError
} from './get-report-error';

export type ToBackendGetReportResponse = ToBackendResponseBase<
  'getReport',
  ToBackendGetReportOutput,
  ToBackendGetReportError
>;

export let zToBackendGetReportResponse = makeToBackendResponseSchema({
  operation: 'getReport',
  output: zToBackendGetReportOutput,
  error: zToBackendGetReportError
}).meta({ id: 'ToBackendGetReportResponse' });

assertTypesEqual<
  ToBackendGetReportResponse,
  z.infer<typeof zToBackendGetReportResponse>
>({ value: true });
