import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardX,
  zDashboardX
} from '#common/types/backend/parts/dashboard/dashboard-x';
import { type Member, zMember } from '#common/types/backend/parts/member';
import {
  type StructX,
  zStructX
} from '#common/types/backend/parts/struct/struct-x';

export type ToBackendGetDashboardOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  dashboard: DashboardX;
};

export let zToBackendGetDashboardOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    dashboard: zDashboardX
  })
  .meta({ id: 'ToBackendGetDashboardOutput' });

assertTypesEqual<
  ToBackendGetDashboardOutput,
  z.infer<typeof zToBackendGetDashboardOutput>
>({ value: true });
