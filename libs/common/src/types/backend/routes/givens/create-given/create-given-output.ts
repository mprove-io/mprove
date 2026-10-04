import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Given, zGiven } from '#common/types/backend/parts/given/given';
import { type Member, zMember } from '#common/types/backend/parts/member';

export type ToBackendCreateGivenOutput = {
  userMember: Member;
  givens: Given[];
};

export let zToBackendCreateGivenOutput = z
  .object({
    userMember: zMember,
    givens: z.array(zGiven)
  })
  .meta({ id: 'ToBackendCreateGivenOutput' });

assertTypesEqual<
  ToBackendCreateGivenOutput,
  z.infer<typeof zToBackendCreateGivenOutput>
>({ value: true });
