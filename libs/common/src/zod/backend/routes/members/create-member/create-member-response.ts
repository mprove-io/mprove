import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateMemberError,
  zToBackendCreateMemberError
} from './create-member-error';

export type ToBackendCreateMemberOutput = {
  member: Member;
};

export type ToBackendCreateMemberResponse = ToBackendResponse<
  ToBackendCreateMemberOutput,
  ToBackendCreateMemberError
>;

export let zToBackendCreateMemberOutput = z
  .object({
    member: zMember
  })
  .meta({ id: 'ToBackendCreateMemberOutput' });

export let zToBackendCreateMemberResponse = makeToBackendResponseSchema({
  success: zToBackendCreateMemberOutput,
  error: zToBackendCreateMemberError
}).meta({ id: 'ToBackendCreateMemberResponse' });

assertTypesEqual<
  ToBackendCreateMemberOutput,
  z.infer<typeof zToBackendCreateMemberOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateMemberResponse,
  z.infer<typeof zToBackendCreateMemberResponse>
>({ value: true });
