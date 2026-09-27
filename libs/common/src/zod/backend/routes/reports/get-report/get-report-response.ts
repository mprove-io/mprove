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
  type ToBackendGetReportError,
  zToBackendGetReportError
} from './get-report-error';

export type ToBackendGetReportOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  report: ReportX;
};

export type ToBackendGetReportResponse = ToBackendResponse<
  ToBackendGetReportOutput,
  ToBackendGetReportError
>;

export let zToBackendGetReportOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    report: zReportX
  })
  .meta({ id: 'ToBackendGetReportOutput' });

export let zToBackendGetReportResponse = makeToBackendResponseSchema({
  success: zToBackendGetReportOutput,
  error: zToBackendGetReportError
}).meta({ id: 'ToBackendGetReportResponse' });

assertTypesEqual<
  ToBackendGetReportOutput,
  z.infer<typeof zToBackendGetReportOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetReportResponse,
  z.infer<typeof zToBackendGetReportResponse>
>({ value: true });
