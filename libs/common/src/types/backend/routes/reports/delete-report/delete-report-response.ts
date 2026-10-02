import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteReportOutput,
  zToBackendDeleteReportOutput
} from '#common/types/backend/routes/reports/delete-report/delete-report-output';
import {
  type ToBackendDeleteReportError,
  zToBackendDeleteReportError
} from './delete-report-error';

export type ToBackendDeleteReportResponse = ToBackendResponseBase<
  'deleteReport',
  ToBackendDeleteReportOutput,
  ToBackendDeleteReportError
>;

export let zToBackendDeleteReportResponse = makeToBackendResponseSchema({
  operation: 'deleteReport',
  output: zToBackendDeleteReportOutput,
  error: zToBackendDeleteReportError
}).meta({ id: 'ToBackendDeleteReportResponse' });

assertTypesEqual<
  ToBackendDeleteReportResponse,
  z.infer<typeof zToBackendDeleteReportResponse>
>({ value: true });
