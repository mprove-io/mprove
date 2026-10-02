import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/member';
import { type ReportX, zReportX } from '#common/types/backend/report-x';
import { type StructX, zStructX } from '#common/types/backend/struct-x';

export type ToBackendGetReportOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  report: ReportX;
};

export let zToBackendGetReportOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    report: zReportX
  })
  .meta({ id: 'ToBackendGetReportOutput' });

assertTypesEqual<
  ToBackendGetReportOutput,
  z.infer<typeof zToBackendGetReportOutput>
>({ value: true });
