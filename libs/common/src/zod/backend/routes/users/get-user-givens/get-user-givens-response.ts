import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MemberGiven,
  zMemberGiven
} from '#common/zod/backend/members/member-given';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type User, zUser } from '#common/zod/backend/user';
import {
  type ToBackendGetUserGivensError,
  zToBackendGetUserGivensError
} from './get-user-givens-error';

export type ToBackendGetUserGivensOutput = {
  user: User;
  memberGivens: MemberGiven[];
};

export type ToBackendGetUserGivensResponse = ToBackendResponse<
  ToBackendGetUserGivensOutput,
  ToBackendGetUserGivensError
>;

export let zToBackendGetUserGivensOutput = z
  .object({
    user: zUser,
    memberGivens: z.array(zMemberGiven)
  })
  .meta({ id: 'ToBackendGetUserGivensOutput' });

export let zToBackendGetUserGivensResponse = makeToBackendResponseSchema({
  success: zToBackendGetUserGivensOutput,
  error: zToBackendGetUserGivensError
}).meta({ id: 'ToBackendGetUserGivensResponse' });

assertTypesEqual<
  ToBackendGetUserGivensOutput,
  z.infer<typeof zToBackendGetUserGivensOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetUserGivensResponse,
  z.infer<typeof zToBackendGetUserGivensResponse>
>({ value: true });
