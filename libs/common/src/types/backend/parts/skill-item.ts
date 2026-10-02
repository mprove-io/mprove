import { z } from 'zod';

export let zSkillItem = z
  .object({
    name: z.string(),
    content: z.string()
  })
  .meta({ id: 'SkillItem' });

export type SkillItem = z.infer<typeof zSkillItem>;
