import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import { type Role, zRole } from '#common/zod/backend/role';

export type ToBackendDeleteRoleOutput = {
  userMember: Member;
  roles: Role[];
};

export let zToBackendDeleteRoleOutput = z
  .object({
    userMember: zMember,
    roles: z.array(zRole)
  })
  .meta({ id: 'ToBackendDeleteRoleOutput' });

assertTypesEqual<
  ToBackendDeleteRoleOutput,
  z.infer<typeof zToBackendDeleteRoleOutput>
>({ value: true });
