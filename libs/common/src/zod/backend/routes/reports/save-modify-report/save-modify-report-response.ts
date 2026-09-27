import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import { type ReportUnit, zReportUnit } from '#common/zod/backend/report-unit';
import { type ReportX, zReportX } from '#common/zod/backend/report-x';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SpaceNode, zSpaceNode } from '#common/zod/backend/space-node';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import {
  type ToBackendSaveModifyReportError,
  zToBackendSaveModifyReportError
} from './save-modify-report-error';

export type ToBackendSaveModifyReportOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  report: ReportX;
  reportUnitDrafts: ReportUnit[];
  reportSpaceNodes: SpaceNode[];
};

export type ToBackendSaveModifyReportResponse = ToBackendResponse<
  ToBackendSaveModifyReportOutput,
  ToBackendSaveModifyReportError
>;

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

export let zToBackendSaveModifyReportResponse = makeToBackendResponseSchema({
  success: zToBackendSaveModifyReportOutput,
  error: zToBackendSaveModifyReportError
}).meta({ id: 'ToBackendSaveModifyReportResponse' });

assertTypesEqual<
  ToBackendSaveModifyReportOutput,
  z.infer<typeof zToBackendSaveModifyReportOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSaveModifyReportResponse,
  z.infer<typeof zToBackendSaveModifyReportResponse>
>({ value: true });
