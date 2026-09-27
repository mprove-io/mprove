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
  type ToBackendSaveCreateReportError,
  zToBackendSaveCreateReportError
} from './save-create-report-error';

export type ToBackendSaveCreateReportOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  report: ReportX;
  reportUnitDrafts: ReportUnit[];
  reportSpaceNodes: SpaceNode[];
};

export type ToBackendSaveCreateReportResponse = ToBackendResponse<
  ToBackendSaveCreateReportOutput,
  ToBackendSaveCreateReportError
>;

export let zToBackendSaveCreateReportOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    report: zReportX,
    reportUnitDrafts: z.array(zReportUnit),
    reportSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendSaveCreateReportOutput' });

export let zToBackendSaveCreateReportResponse = makeToBackendResponseSchema({
  success: zToBackendSaveCreateReportOutput,
  error: zToBackendSaveCreateReportError
}).meta({ id: 'ToBackendSaveCreateReportResponse' });

assertTypesEqual<
  ToBackendSaveCreateReportOutput,
  z.infer<typeof zToBackendSaveCreateReportOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSaveCreateReportResponse,
  z.infer<typeof zToBackendSaveCreateReportResponse>
>({ value: true });
