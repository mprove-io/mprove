import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendSaveModifyReportOutput,
  zToBackendSaveModifyReportOutput
} from '#common/zod/backend/routes/reports/save-modify-report/save-modify-report-output';
import {
  type ToBackendSaveModifyReportError,
  zToBackendSaveModifyReportError
} from './save-modify-report-error';

export type ToBackendSaveModifyReportResponse = ToBackendResponseBase<
  'saveModifyReport',
  ToBackendSaveModifyReportOutput,
  ToBackendSaveModifyReportError
>;

export let zToBackendSaveModifyReportResponse = makeToBackendResponseSchema({
  operation: 'saveModifyReport',
  output: zToBackendSaveModifyReportOutput,
  error: zToBackendSaveModifyReportError
}).meta({ id: 'ToBackendSaveModifyReportResponse' });

assertTypesEqual<
  ToBackendSaveModifyReportResponse,
  z.infer<typeof zToBackendSaveModifyReportResponse>
>({ value: true });
