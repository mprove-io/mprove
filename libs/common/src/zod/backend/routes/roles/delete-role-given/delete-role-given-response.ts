import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type Role, zRole } from '#common/zod/backend/role';
import {
  type ToBackendDeleteRoleGivenError,
  zToBackendDeleteRoleGivenError
} from './delete-role-given-error';

export type ToBackendDeleteRoleGivenOutput = {
  userMember: Member;
  roles: Role[];
};

export type ToBackendDeleteRoleGivenResponse = ToBackendResponse<
  ToBackendDeleteRoleGivenOutput,
  ToBackendDeleteRoleGivenError
>;

export let zToBackendDeleteRoleGivenOutput = z
  .object({
    userMember: zMember,
    roles: z.array(zRole)
  })
  .meta({ id: 'ToBackendDeleteRoleGivenOutput' });

export let zToBackendDeleteRoleGivenResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteRoleGivenOutput,
  error: zToBackendDeleteRoleGivenError
}).meta({ id: 'ToBackendDeleteRoleGivenResponse' });

assertTypesEqual<
  ToBackendDeleteRoleGivenOutput,
  z.infer<typeof zToBackendDeleteRoleGivenOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteRoleGivenResponse,
  z.infer<typeof zToBackendDeleteRoleGivenResponse>
>({ value: true });
