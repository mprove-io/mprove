import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';

export type ToBackendEditMemberOutput = {
  member: Member;
};

export let zToBackendEditMemberOutput = z
  .object({
    member: zMember
  })
  .meta({ id: 'ToBackendEditMemberOutput' });

assertTypesEqual<
  ToBackendEditMemberOutput,
  z.infer<typeof zToBackendEditMemberOutput>
>({ value: true });
