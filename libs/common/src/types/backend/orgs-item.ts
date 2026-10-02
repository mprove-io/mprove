import { z } from 'zod';

export let zOrgsItem = z
  .object({
    orgId: z.string(),
    name: z.string()
  })
  .meta({ id: 'OrgsItem' });

export type OrgsItem = z.infer<typeof zOrgsItem>;
