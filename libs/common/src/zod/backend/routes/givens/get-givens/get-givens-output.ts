import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Given, zGiven } from '#common/zod/backend/given';
import { type Member, zMember } from '#common/zod/backend/member';

export type ToBackendGetGivensOutput = {
  userMember: Member;
  givens: Given[];
};

export let zToBackendGetGivensOutput = z
  .object({
    userMember: zMember,
    givens: z.array(zGiven)
  })
  .meta({ id: 'ToBackendGetGivensOutput' });

assertTypesEqual<
  ToBackendGetGivensOutput,
  z.infer<typeof zToBackendGetGivensOutput>
>({ value: true });
