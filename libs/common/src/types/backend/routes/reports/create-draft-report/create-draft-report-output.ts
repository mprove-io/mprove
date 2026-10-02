import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import {
  type ReportUnit,
  zReportUnit
} from '#common/types/backend/parts/report-unit';
import { type ReportX, zReportX } from '#common/types/backend/parts/report-x';
import { type StructX, zStructX } from '#common/types/backend/parts/struct-x';

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
