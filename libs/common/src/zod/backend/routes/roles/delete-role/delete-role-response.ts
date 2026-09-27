import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type Role, zRole } from '#common/zod/backend/role';
import {
  type ToBackendDeleteRoleError,
  zToBackendDeleteRoleError
} from './delete-role-error';

export type ToBackendDeleteRoleOutput = {
  userMember: Member;
  roles: Role[];
};

export type ToBackendDeleteRoleResponse = ToBackendResponse<
  ToBackendDeleteRoleOutput,
  ToBackendDeleteRoleError
>;

export let zToBackendDeleteRoleOutput = z
  .object({
    userMember: zMember,
    roles: z.array(zRole)
  })
  .meta({ id: 'ToBackendDeleteRoleOutput' });

export let zToBackendDeleteRoleResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteRoleOutput,
  error: zToBackendDeleteRoleError
}).meta({ id: 'ToBackendDeleteRoleResponse' });

assertTypesEqual<
  ToBackendDeleteRoleOutput,
  z.infer<typeof zToBackendDeleteRoleOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteRoleResponse,
  z.infer<typeof zToBackendDeleteRoleResponse>
>({ value: true });
