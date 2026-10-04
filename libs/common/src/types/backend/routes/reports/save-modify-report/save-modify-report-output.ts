import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import {
  type ReportUnit,
  zReportUnit
} from '#common/types/backend/parts/report/report-unit';
import {
  type ReportX,
  zReportX
} from '#common/types/backend/parts/report/report-x';
import {
  type SpaceNode,
  zSpaceNode
} from '#common/types/backend/parts/space-node';
import {
  type StructX,
  zStructX
} from '#common/types/backend/parts/struct/struct-x';

export type ToBackendSaveModifyReportOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  report: ReportX;
  reportUnitDrafts: ReportUnit[];
  reportSpaceNodes: SpaceNode[];
};

export let zToBackendSaveModifyReportOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    report: zReportX,
    reportUnitDrafts: z.array(zReportUnit),
    reportSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendSaveModifyReportOutput' });

assertTypesEqual<
  ToBackendSaveModifyReportOutput,
  z.infer<typeof zToBackendSaveModifyReportOutput>
>({ value: true });
