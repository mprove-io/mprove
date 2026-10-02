import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ChartUnit,
  zChartUnit
} from '#common/types/backend/parts/chart-unit';
import { type Member, zMember } from '#common/types/backend/parts/member';
import { type ModelX, zModelX } from '#common/types/backend/parts/model-x';
import {
  type SpaceNode,
  zSpaceNode
} from '#common/types/backend/parts/space-node';
import { type StructX, zStructX } from '#common/types/backend/parts/struct-x';

export type ToBackendGetChartsOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  models: ModelX[];
  chartUnitDrafts: ChartUnit[];
  chartSpaceNodes: SpaceNode[];
};

export let zToBackendGetChartsOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    models: z.array(zModelX),
    chartUnitDrafts: z.array(zChartUnit),
    chartSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendGetChartsOutput' });

assertTypesEqual<
  ToBackendGetChartsOutput,
  z.infer<typeof zToBackendGetChartsOutput>
>({ value: true });
