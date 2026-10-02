import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendSaveCreateReportOutput,
  zToBackendSaveCreateReportOutput
} from '#common/types/backend/routes/reports/save-create-report/save-create-report-output';
import {
  type ToBackendSaveCreateReportError,
  zToBackendSaveCreateReportError
} from './save-create-report-error';

export type ToBackendSaveCreateReportResponse = ToBackendResponseBase<
  'saveCreateReport',
  ToBackendSaveCreateReportOutput,
  ToBackendSaveCreateReportError
>;

export let zToBackendSaveCreateReportResponse = makeToBackendResponseSchema({
  operation: 'saveCreateReport',
  output: zToBackendSaveCreateReportOutput,
  error: zToBackendSaveCreateReportError
}).meta({ id: 'ToBackendSaveCreateReportResponse' });

assertTypesEqual<
  ToBackendSaveCreateReportResponse,
  z.infer<typeof zToBackendSaveCreateReportResponse>
>({ value: true });
