import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendEditDraftReportOutput,
  zToBackendEditDraftReportOutput
} from '#common/zod/backend/routes/reports/edit-draft-report/edit-draft-report-output';
import {
  type ToBackendEditDraftReportError,
  zToBackendEditDraftReportError
} from './edit-draft-report-error';

export type ToBackendEditDraftReportResponse = ToBackendResponseBase<
  'editDraftReport',
  ToBackendEditDraftReportOutput,
  ToBackendEditDraftReportError
>;

export let zToBackendEditDraftReportResponse = makeToBackendResponseSchema({
  operation: 'editDraftReport',
  output: zToBackendEditDraftReportOutput,
  error: zToBackendEditDraftReportError
}).meta({ id: 'ToBackendEditDraftReportResponse' });

assertTypesEqual<
  ToBackendEditDraftReportResponse,
  z.infer<typeof zToBackendEditDraftReportResponse>
>({ value: true });
