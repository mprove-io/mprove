import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ChartX, zChartX } from '#common/types/backend/chart-x';
import { type Member, zMember } from '#common/types/backend/member';

export type ToBackendGetChartOutput = {
  userMember: Member;
  chart: ChartX;
};

export let zToBackendGetChartOutput = z
  .object({
    userMember: zMember,
    chart: zChartX
  })
  .meta({ id: 'ToBackendGetChartOutput' });

assertTypesEqual<
  ToBackendGetChartOutput,
  z.infer<typeof zToBackendGetChartOutput>
>({ value: true });
