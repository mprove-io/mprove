import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type DashboardX, zDashboardX } from '#common/zod/backend/dashboard-x';
import { type Member, zMember } from '#common/zod/backend/member';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';

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
