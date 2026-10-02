import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';

export type ToBackendCreateMemberOutput = {
  member: Member;
};

export let zToBackendCreateMemberOutput = z
  .object({
    member: zMember
  })
  .meta({ id: 'ToBackendCreateMemberOutput' });

assertTypesEqual<
  ToBackendCreateMemberOutput,
  z.infer<typeof zToBackendCreateMemberOutput>
>({ value: true });
