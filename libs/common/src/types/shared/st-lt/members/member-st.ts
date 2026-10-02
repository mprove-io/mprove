import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type MemberSt = {
  email: string;
  alias: string;
  firstName: string;
  lastName: string;
  roles: string[];
};

export let zMemberSt = z
  .object({
    email: z.string(),
    alias: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    roles: z.array(z.string())
  })
  .meta({ id: 'MemberSt' });

assertTypesEqual<MemberSt, z.infer<typeof zMemberSt>>({ value: true });
