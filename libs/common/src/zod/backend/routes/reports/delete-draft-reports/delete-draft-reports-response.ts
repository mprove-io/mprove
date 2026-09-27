import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ReportUnit, zReportUnit } from '#common/zod/backend/report-unit';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteDraftReportsError,
  zToBackendDeleteDraftReportsError
} from './delete-draft-reports-error';

export type ToBackendDeleteDraftReportsOutput = {
  reportUnitDrafts: ReportUnit[];
};

export type ToBackendDeleteDraftReportsResponse = ToBackendResponse<
  ToBackendDeleteDraftReportsOutput,
  ToBackendDeleteDraftReportsError
>;

export let zToBackendDeleteDraftReportsOutput = z
  .object({
    reportUnitDrafts: z.array(zReportUnit)
  })
  .meta({ id: 'ToBackendDeleteDraftReportsOutput' });

export let zToBackendDeleteDraftReportsResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteDraftReportsOutput,
  error: zToBackendDeleteDraftReportsError
}).meta({ id: 'ToBackendDeleteDraftReportsResponse' });

assertTypesEqual<
  ToBackendDeleteDraftReportsOutput,
  z.infer<typeof zToBackendDeleteDraftReportsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteDraftReportsResponse,
  z.infer<typeof zToBackendDeleteDraftReportsResponse>
>({ value: true });
