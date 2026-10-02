import { z } from 'zod';

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

export type Member = z.infer<typeof zMember>;
