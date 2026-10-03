import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type SkillItem = { name: string; content: string };

export let zSkillItem = z
  .object({
    name: z.string(),
    content: z.string()
  })
  .meta({ id: 'SkillItem' });

assertTypesEqual<SkillItem, z.infer<typeof zSkillItem>>({ value: true });
