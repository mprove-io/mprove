import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import { type ReportUnit, zReportUnit } from '#common/zod/backend/report-unit';
import { type ReportX, zReportX } from '#common/zod/backend/report-x';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';

export type ToBackendCreateDraftReportOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  report: ReportX;
  reportUnitDrafts: ReportUnit[];
};

export let zToBackendCreateDraftReportOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    report: zReportX,
    reportUnitDrafts: z.array(zReportUnit)
  })
  .meta({ id: 'ToBackendCreateDraftReportOutput' });

assertTypesEqual<
  ToBackendCreateDraftReportOutput,
  z.infer<typeof zToBackendCreateDraftReportOutput>
>({ value: true });
