import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type Member = {
  projectId: string;
  memberId: string;
  email: string;
  alias: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarSmall: string;
  roles: string[];
  isAdmin: boolean;
  isEditor: boolean;
  isExplorer: boolean;
  serverTs: number;
};

export let zMember = z
  .object({
    projectId: z.string(),
    memberId: z.string(),
    email: z.string(),
    alias: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    fullName: z.string(),
    avatarSmall: z.string(),
    roles: z.array(z.string()),
    isAdmin: z.boolean(),
    isEditor: z.boolean(),
    isExplorer: z.boolean(),
    serverTs: z.number().int()
  })
  .meta({ id: 'Member' });

assertTypesEqual<Member, z.infer<typeof zMember>>({ value: true });
