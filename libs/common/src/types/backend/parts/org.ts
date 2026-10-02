import { z } from 'zod';

export let zOrg = z
  .object({
    orgId: z.string(),
    name: z.string(),
    ownerId: z.string(),
    ownerEmail: z.string(),
    serverTs: z.number().int()
  })
  .meta({ id: 'Org' });

export type Org = z.infer<typeof zOrg>;
