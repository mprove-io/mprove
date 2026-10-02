import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SkillItem,
  zSkillItem
} from '#common/types/backend/parts/skill-item';

export type McpToolGetSkillsInput = Record<string, never>;

export let zMcpToolGetSkillsInput = z
  .object({})
  .meta({ id: 'McpToolGetSkillsInput' });

assertTypesEqual<McpToolGetSkillsInput, z.infer<typeof zMcpToolGetSkillsInput>>(
  { value: true }
);

export type McpToolGetSkillsOutput = {
  skillItems: SkillItem[];
};

export let zMcpToolGetSkillsOutput = z
  .object({
    skillItems: z.array(zSkillItem)
  })
  .meta({ id: 'McpToolGetSkillsOutput' });

assertTypesEqual<
  McpToolGetSkillsOutput,
  z.infer<typeof zMcpToolGetSkillsOutput>
>({ value: true });
