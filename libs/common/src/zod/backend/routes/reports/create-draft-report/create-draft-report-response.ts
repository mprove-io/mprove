import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendCreateDraftReportOutput,
  zToBackendCreateDraftReportOutput
} from '#common/zod/backend/routes/reports/create-draft-report/create-draft-report-output';
import {
  type ToBackendCreateDraftReportError,
  zToBackendCreateDraftReportError
} from './create-draft-report-error';

export type ToBackendCreateDraftReportResponse = ToBackendResponseBase<
  'createDraftReport',
  ToBackendCreateDraftReportOutput,
  ToBackendCreateDraftReportError
>;

export let zToBackendCreateDraftReportResponse = makeToBackendResponseSchema({
  operation: 'createDraftReport',
  output: zToBackendCreateDraftReportOutput,
  error: zToBackendCreateDraftReportError
}).meta({ id: 'ToBackendCreateDraftReportResponse' });

assertTypesEqual<
  ToBackendCreateDraftReportResponse,
  z.infer<typeof zToBackendCreateDraftReportResponse>
>({ value: true });
