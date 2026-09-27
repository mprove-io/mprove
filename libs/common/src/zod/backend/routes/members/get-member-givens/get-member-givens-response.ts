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
import {
  type ToBackendGetMemberGivensError,
  zToBackendGetMemberGivensError
} from './get-member-givens-error';

export type ToBackendGetMemberGivensOutput = {
  memberGivens: MemberGiven[];
};

export type ToBackendGetMemberGivensResponse = ToBackendResponse<
  ToBackendGetMemberGivensOutput,
  ToBackendGetMemberGivensError
>;

export let zToBackendGetMemberGivensOutput = z
  .object({
    memberGivens: z.array(zMemberGiven)
  })
  .meta({ id: 'ToBackendGetMemberGivensOutput' });

export let zToBackendGetMemberGivensResponse = makeToBackendResponseSchema({
  success: zToBackendGetMemberGivensOutput,
  error: zToBackendGetMemberGivensError
}).meta({ id: 'ToBackendGetMemberGivensResponse' });

assertTypesEqual<
  ToBackendGetMemberGivensOutput,
  z.infer<typeof zToBackendGetMemberGivensOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetMemberGivensResponse,
  z.infer<typeof zToBackendGetMemberGivensResponse>
>({ value: true });
