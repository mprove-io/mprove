import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import { type ReportX, zReportX } from '#common/zod/backend/report-x';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import {
  type ToBackendEditDraftReportError,
  zToBackendEditDraftReportError
} from './edit-draft-report-error';

export type ToBackendEditDraftReportOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  report: ReportX;
};

export type ToBackendEditDraftReportResponse = ToBackendResponse<
  ToBackendEditDraftReportOutput,
  ToBackendEditDraftReportError
>;

export let zToBackendEditDraftReportOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    report: zReportX
  })
  .meta({ id: 'ToBackendEditDraftReportOutput' });

export let zToBackendEditDraftReportResponse = makeToBackendResponseSchema({
  success: zToBackendEditDraftReportOutput,
  error: zToBackendEditDraftReportError
}).meta({ id: 'ToBackendEditDraftReportResponse' });

assertTypesEqual<
  ToBackendEditDraftReportOutput,
  z.infer<typeof zToBackendEditDraftReportOutput>
>({ value: true });

assertTypesEqual<
  ToBackendEditDraftReportResponse,
  z.infer<typeof zToBackendEditDraftReportResponse>
>({ value: true });
