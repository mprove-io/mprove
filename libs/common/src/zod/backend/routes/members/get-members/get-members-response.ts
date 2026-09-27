import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type Role, zRole } from '#common/zod/backend/role';
import {
  type ToBackendGetMembersError,
  zToBackendGetMembersError
} from './get-members-error';

export type ToBackendGetMembersOutput = {
  userMember: Member;
  members: Member[];
  roles: Role[];
  total: number;
};

export type ToBackendGetMembersResponse = ToBackendResponse<
  ToBackendGetMembersOutput,
  ToBackendGetMembersError
>;

export let zToBackendGetMembersOutput = z
  .object({
    userMember: zMember,
    members: z.array(zMember),
    roles: z.array(zRole),
    total: z.number()
  })
  .meta({ id: 'ToBackendGetMembersOutput' });

export let zToBackendGetMembersResponse = makeToBackendResponseSchema({
  success: zToBackendGetMembersOutput,
  error: zToBackendGetMembersError
}).meta({ id: 'ToBackendGetMembersResponse' });

assertTypesEqual<
  ToBackendGetMembersOutput,
  z.infer<typeof zToBackendGetMembersOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetMembersResponse,
  z.infer<typeof zToBackendGetMembersResponse>
>({ value: true });
