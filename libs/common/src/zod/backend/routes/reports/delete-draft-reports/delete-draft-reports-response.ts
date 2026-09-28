import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteDraftReportsOutput,
  zToBackendDeleteDraftReportsOutput
} from '#common/zod/backend/routes/reports/delete-draft-reports/delete-draft-reports-output';
import {
  type ToBackendDeleteDraftReportsError,
  zToBackendDeleteDraftReportsError
} from './delete-draft-reports-error';

export type ToBackendDeleteDraftReportsResponse = ToBackendResponseBase<
  'deleteDraftReports',
  ToBackendDeleteDraftReportsOutput,
  ToBackendDeleteDraftReportsError
>;

export let zToBackendDeleteDraftReportsResponse = makeToBackendResponseSchema({
  operation: 'deleteDraftReports',
  output: zToBackendDeleteDraftReportsOutput,
  error: zToBackendDeleteDraftReportsError
}).meta({ id: 'ToBackendDeleteDraftReportsResponse' });

assertTypesEqual<
  ToBackendDeleteDraftReportsResponse,
  z.infer<typeof zToBackendDeleteDraftReportsResponse>
>({ value: true });
