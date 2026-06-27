import { z } from 'zod';

export let zAccessRoleCombined = z.object({
  role: z.string(),
  isDirect: z.boolean()
});

export type AccessRoleCombined = z.infer<typeof zAccessRoleCombined>;
