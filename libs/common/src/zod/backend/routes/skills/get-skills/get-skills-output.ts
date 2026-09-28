import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type SkillItem, zSkillItem } from '#common/zod/backend/skill-item';

export type ToBackendGetSkillsOutput = {
  skillItems: SkillItem[];
};

export let zToBackendGetSkillsOutput = z
  .object({
    skillItems: z.array(zSkillItem)
  })
  .meta({ id: 'ToBackendGetSkillsOutput' });

assertTypesEqual<
  ToBackendGetSkillsOutput,
  z.infer<typeof zToBackendGetSkillsOutput>
>({ value: true });
