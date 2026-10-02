import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import { type Role, zRole } from '#common/types/backend/parts/role';

export type ToBackendEditRoleGivenOutput = {
  userMember: Member;
  roles: Role[];
};

export let zToBackendEditRoleGivenOutput = z
  .object({
    userMember: zMember,
    roles: z.array(zRole)
  })
  .meta({ id: 'ToBackendEditRoleGivenOutput' });

assertTypesEqual<
  ToBackendEditRoleGivenOutput,
  z.infer<typeof zToBackendEditRoleGivenOutput>
>({ value: true });
