import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import {
  type ReportX,
  zReportX
} from '#common/types/backend/parts/report/report-x';
import {
  type StructX,
  zStructX
} from '#common/types/backend/parts/struct/struct-x';

export type ToBackendEditDraftReportOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  report: ReportX;
};

export let zToBackendEditDraftReportOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    report: zReportX
  })
  .meta({ id: 'ToBackendEditDraftReportOutput' });

assertTypesEqual<
  ToBackendEditDraftReportOutput,
  z.infer<typeof zToBackendEditDraftReportOutput>
>({ value: true });
