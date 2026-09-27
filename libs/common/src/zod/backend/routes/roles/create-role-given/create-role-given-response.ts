import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type Role, zRole } from '#common/zod/backend/role';
import {
  type ToBackendCreateRoleGivenError,
  zToBackendCreateRoleGivenError
} from './create-role-given-error';

export type ToBackendCreateRoleGivenOutput = {
  userMember: Member;
  roles: Role[];
};

export type ToBackendCreateRoleGivenResponse = ToBackendResponse<
  ToBackendCreateRoleGivenOutput,
  ToBackendCreateRoleGivenError
>;

export let zToBackendCreateRoleGivenOutput = z
  .object({
    userMember: zMember,
    roles: z.array(zRole)
  })
  .meta({ id: 'ToBackendCreateRoleGivenOutput' });

export let zToBackendCreateRoleGivenResponse = makeToBackendResponseSchema({
  success: zToBackendCreateRoleGivenOutput,
  error: zToBackendCreateRoleGivenError
}).meta({ id: 'ToBackendCreateRoleGivenResponse' });

assertTypesEqual<
  ToBackendCreateRoleGivenOutput,
  z.infer<typeof zToBackendCreateRoleGivenOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateRoleGivenResponse,
  z.infer<typeof zToBackendCreateRoleGivenResponse>
>({ value: true });
