import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import { type Role, zRole } from '#common/types/backend/parts/role';

export type ToBackendCreateRoleGivenOutput = {
  userMember: Member;
  roles: Role[];
};

export let zToBackendCreateRoleGivenOutput = z
  .object({
    userMember: zMember,
    roles: z.array(zRole)
  })
  .meta({ id: 'ToBackendCreateRoleGivenOutput' });

assertTypesEqual<
  ToBackendCreateRoleGivenOutput,
  z.infer<typeof zToBackendCreateRoleGivenOutput>
>({ value: true });
