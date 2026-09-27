import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type DashboardX, zDashboardX } from '#common/zod/backend/dashboard-x';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import {
  type ToBackendGetDashboardError,
  zToBackendGetDashboardError
} from './get-dashboard-error';

export type ToBackendGetDashboardOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  dashboard: DashboardX;
};

export type ToBackendGetDashboardResponse = ToBackendResponse<
  ToBackendGetDashboardOutput,
  ToBackendGetDashboardError
>;

export let zToBackendGetDashboardOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    dashboard: zDashboardX
  })
  .meta({ id: 'ToBackendGetDashboardOutput' });

export let zToBackendGetDashboardResponse = makeToBackendResponseSchema({
  success: zToBackendGetDashboardOutput,
  error: zToBackendGetDashboardError
}).meta({ id: 'ToBackendGetDashboardResponse' });

assertTypesEqual<
  ToBackendGetDashboardOutput,
  z.infer<typeof zToBackendGetDashboardOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetDashboardResponse,
  z.infer<typeof zToBackendGetDashboardResponse>
>({ value: true });
