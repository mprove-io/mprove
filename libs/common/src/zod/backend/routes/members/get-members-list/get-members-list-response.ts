import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type EnvUser, zEnvUser } from '#common/zod/backend/env-user';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetMembersListError,
  zToBackendGetMembersListError
} from './get-members-list-error';

export type ToBackendGetMembersListOutput = {
  userMember: Member;
  membersList: EnvUser[];
};

export type ToBackendGetMembersListResponse = ToBackendResponse<
  ToBackendGetMembersListOutput,
  ToBackendGetMembersListError
>;

export let zToBackendGetMembersListOutput = z
  .object({
    userMember: zMember,
    membersList: z.array(zEnvUser)
  })
  .meta({ id: 'ToBackendGetMembersListOutput' });

export let zToBackendGetMembersListResponse = makeToBackendResponseSchema({
  success: zToBackendGetMembersListOutput,
  error: zToBackendGetMembersListError
}).meta({ id: 'ToBackendGetMembersListResponse' });

assertTypesEqual<
  ToBackendGetMembersListOutput,
  z.infer<typeof zToBackendGetMembersListOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetMembersListResponse,
  z.infer<typeof zToBackendGetMembersListResponse>
>({ value: true });
