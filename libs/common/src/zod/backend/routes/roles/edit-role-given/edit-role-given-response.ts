import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type Role, zRole } from '#common/zod/backend/role';
import {
  type ToBackendEditRoleGivenError,
  zToBackendEditRoleGivenError
} from './edit-role-given-error';

export type ToBackendEditRoleGivenOutput = {
  userMember: Member;
  roles: Role[];
};

export type ToBackendEditRoleGivenResponse = ToBackendResponse<
  ToBackendEditRoleGivenOutput,
  ToBackendEditRoleGivenError
>;

export let zToBackendEditRoleGivenOutput = z
  .object({
    userMember: zMember,
    roles: z.array(zRole)
  })
  .meta({ id: 'ToBackendEditRoleGivenOutput' });

export let zToBackendEditRoleGivenResponse = makeToBackendResponseSchema({
  success: zToBackendEditRoleGivenOutput,
  error: zToBackendEditRoleGivenError
}).meta({ id: 'ToBackendEditRoleGivenResponse' });

assertTypesEqual<
  ToBackendEditRoleGivenOutput,
  z.infer<typeof zToBackendEditRoleGivenOutput>
>({ value: true });

assertTypesEqual<
  ToBackendEditRoleGivenResponse,
  z.infer<typeof zToBackendEditRoleGivenResponse>
>({ value: true });
