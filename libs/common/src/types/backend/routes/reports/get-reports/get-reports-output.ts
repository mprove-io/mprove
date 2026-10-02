import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import { type ModelX, zModelX } from '#common/types/backend/parts/model-x';
import {
  type ReportUnit,
  zReportUnit
} from '#common/types/backend/parts/report-unit';
import {
  type SpaceNode,
  zSpaceNode
} from '#common/types/backend/parts/space-node';
import { type StructX, zStructX } from '#common/types/backend/parts/struct-x';

export type ToBackendGetReportsOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  reportUnitDrafts: ReportUnit[];
  reportSpaceNodes: SpaceNode[];
  storeModels: ModelX[];
};

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

assertTypesEqual<
  ToBackendGetReportsOutput,
  z.infer<typeof zToBackendGetReportsOutput>
>({ value: true });
