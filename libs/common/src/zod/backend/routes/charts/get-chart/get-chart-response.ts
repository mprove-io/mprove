import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ChartX, zChartX } from '#common/zod/backend/chart-x';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetChartError,
  zToBackendGetChartError
} from './get-chart-error';

export type ToBackendGetChartOutput = {
  userMember: Member;
  chart: ChartX;
};

export type ToBackendGetChartResponse = ToBackendResponse<
  ToBackendGetChartOutput,
  ToBackendGetChartError
>;

export let zToBackendGetChartOutput = z
  .object({
    userMember: zMember,
    chart: zChartX
  })
  .meta({ id: 'ToBackendGetChartOutput' });

export let zToBackendGetChartResponse = makeToBackendResponseSchema({
  success: zToBackendGetChartOutput,
  error: zToBackendGetChartError
}).meta({ id: 'ToBackendGetChartResponse' });

assertTypesEqual<
  ToBackendGetChartOutput,
  z.infer<typeof zToBackendGetChartOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetChartResponse,
  z.infer<typeof zToBackendGetChartResponse>
>({ value: true });
