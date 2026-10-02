import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import { type Role, zRole } from '#common/types/backend/parts/role';

export type ToBackendCreateRoleOutput = {
  userMember: Member;
  roles: Role[];
};

export let zToBackendCreateRoleOutput = z
  .object({
    userMember: zMember,
    roles: z.array(zRole)
  })
  .meta({ id: 'ToBackendCreateRoleOutput' });

assertTypesEqual<
  ToBackendCreateRoleOutput,
  z.infer<typeof zToBackendCreateRoleOutput>
>({ value: true });
