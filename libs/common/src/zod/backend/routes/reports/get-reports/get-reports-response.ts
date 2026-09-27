import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import { type ModelX, zModelX } from '#common/zod/backend/model-x';
import { type ReportUnit, zReportUnit } from '#common/zod/backend/report-unit';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SpaceNode, zSpaceNode } from '#common/zod/backend/space-node';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import {
  type ToBackendGetReportsError,
  zToBackendGetReportsError
} from './get-reports-error';

export type ToBackendGetReportsOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  reportUnitDrafts: ReportUnit[];
  reportSpaceNodes: SpaceNode[];
  storeModels: ModelX[];
};

export type ToBackendGetReportsResponse = ToBackendResponse<
  ToBackendGetReportsOutput,
  ToBackendGetReportsError
>;

export let zToBackendGetReportsOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    reportUnitDrafts: z.array(zReportUnit),
    reportSpaceNodes: z.array(zSpaceNode),
    storeModels: z.array(zModelX)
  })
  .meta({ id: 'ToBackendGetReportsOutput' });

export let zToBackendGetReportsResponse = makeToBackendResponseSchema({
  success: zToBackendGetReportsOutput,
  error: zToBackendGetReportsError
}).meta({ id: 'ToBackendGetReportsResponse' });

assertTypesEqual<
  ToBackendGetReportsOutput,
  z.infer<typeof zToBackendGetReportsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetReportsResponse,
  z.infer<typeof zToBackendGetReportsResponse>
>({ value: true });
