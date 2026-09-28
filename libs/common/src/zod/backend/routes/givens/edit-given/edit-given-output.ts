import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Given, zGiven } from '#common/zod/backend/given';
import { type Member, zMember } from '#common/zod/backend/member';

export type ToBackendEditGivenOutput = {
  userMember: Member;
  givens: Given[];
};

export let zToBackendEditGivenOutput = z
  .object({
    userMember: zMember,
    givens: z.array(zGiven)
  })
  .meta({ id: 'ToBackendEditGivenOutput' });

assertTypesEqual<
  ToBackendEditGivenOutput,
  z.infer<typeof zToBackendEditGivenOutput>
>({ value: true });
