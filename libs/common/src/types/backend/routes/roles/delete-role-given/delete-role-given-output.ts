import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import { type Role, zRole } from '#common/types/backend/parts/role';

export type ToBackendDeleteRoleGivenOutput = {
  userMember: Member;
  roles: Role[];
};

export let zToBackendDeleteRoleGivenOutput = z
  .object({
    userMember: zMember,
    roles: z.array(zRole)
  })
  .meta({ id: 'ToBackendDeleteRoleGivenOutput' });

assertTypesEqual<
  ToBackendDeleteRoleGivenOutput,
  z.infer<typeof zToBackendDeleteRoleGivenOutput>
>({ value: true });
