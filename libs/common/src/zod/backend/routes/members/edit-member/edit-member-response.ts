import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendEditMemberError,
  zToBackendEditMemberError
} from './edit-member-error';

export type ToBackendEditMemberOutput = {
  member: Member;
};

export type ToBackendEditMemberResponse = ToBackendResponse<
  ToBackendEditMemberOutput,
  ToBackendEditMemberError
>;

export let zToBackendEditMemberOutput = z
  .object({
    member: zMember
  })
  .meta({ id: 'ToBackendEditMemberOutput' });

export let zToBackendEditMemberResponse = makeToBackendResponseSchema({
  success: zToBackendEditMemberOutput,
  error: zToBackendEditMemberError
}).meta({ id: 'ToBackendEditMemberResponse' });

assertTypesEqual<
  ToBackendEditMemberOutput,
  z.infer<typeof zToBackendEditMemberOutput>
>({ value: true });

assertTypesEqual<
  ToBackendEditMemberResponse,
  z.infer<typeof zToBackendEditMemberResponse>
>({ value: true });
