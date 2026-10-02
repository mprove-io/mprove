import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Given, zGiven } from '#common/types/backend/given';
import { type Member, zMember } from '#common/types/backend/member';

export type ToBackendDeleteGivenOutput = {
  userMember: Member;
  givens: Given[];
};

export let zToBackendDeleteGivenOutput = z
  .object({
    userMember: zMember,
    givens: z.array(zGiven)
  })
  .meta({ id: 'ToBackendDeleteGivenOutput' });

assertTypesEqual<
  ToBackendDeleteGivenOutput,
  z.infer<typeof zToBackendDeleteGivenOutput>
>({ value: true });
