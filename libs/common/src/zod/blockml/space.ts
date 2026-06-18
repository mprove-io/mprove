import { z } from 'zod';

export let zSpace = z
  .object({
    space: z.string(),
    title: z.string().nullish(),
    filePath: z.string(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(z.string())
  })
  .meta({ id: 'Space' });

export type Space = z.infer<typeof zSpace>;
