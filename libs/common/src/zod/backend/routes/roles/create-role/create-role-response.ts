import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type Role, zRole } from '#common/zod/backend/role';
import {
  type ToBackendCreateRoleError,
  zToBackendCreateRoleError
} from './create-role-error';

export type ToBackendCreateRoleOutput = {
  userMember: Member;
  roles: Role[];
};

export type ToBackendCreateRoleResponse = ToBackendResponse<
  ToBackendCreateRoleOutput,
  ToBackendCreateRoleError
>;

export let zToBackendCreateRoleOutput = z
  .object({
    userMember: zMember,
    roles: z.array(zRole)
  })
  .meta({ id: 'ToBackendCreateRoleOutput' });

export let zToBackendCreateRoleResponse = makeToBackendResponseSchema({
  success: zToBackendCreateRoleOutput,
  error: zToBackendCreateRoleError
}).meta({ id: 'ToBackendCreateRoleResponse' });

assertTypesEqual<
  ToBackendCreateRoleOutput,
  z.infer<typeof zToBackendCreateRoleOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateRoleResponse,
  z.infer<typeof zToBackendCreateRoleResponse>
>({ value: true });
