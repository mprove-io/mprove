import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ChartUnit, zChartUnit } from '#common/zod/backend/chart-unit';
import { type Member, zMember } from '#common/zod/backend/member';
import { type ModelX, zModelX } from '#common/zod/backend/model-x';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SpaceNode, zSpaceNode } from '#common/zod/backend/space-node';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import {
  type ToBackendGetChartsError,
  zToBackendGetChartsError
} from './get-charts-error';

export type ToBackendGetChartsOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  models: ModelX[];
  chartUnitDrafts: ChartUnit[];
  chartSpaceNodes: SpaceNode[];
};

export type ToBackendGetChartsResponse = ToBackendResponse<
  ToBackendGetChartsOutput,
  ToBackendGetChartsError
>;

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

export let zToBackendGetChartsResponse = makeToBackendResponseSchema({
  success: zToBackendGetChartsOutput,
  error: zToBackendGetChartsError
}).meta({ id: 'ToBackendGetChartsResponse' });

assertTypesEqual<
  ToBackendGetChartsOutput,
  z.infer<typeof zToBackendGetChartsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetChartsResponse,
  z.infer<typeof zToBackendGetChartsResponse>
>({ value: true });
