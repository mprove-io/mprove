import { z } from 'zod';
import { zSkillItem } from '#common/zod/backend/skill-item';

export let zMcpToolGetSkillsInput = z
  .object({})
  .meta({ id: 'McpToolGetSkillsInput' });

export let zMcpToolGetSkillsOutput = z
  .object({
    skillItems: z.array(zSkillItem)
  })
  .meta({ id: 'McpToolGetSkillsOutput' });

export type McpToolGetSkillsInput = z.infer<typeof zMcpToolGetSkillsInput>;

export type McpToolGetSkillsOutput = z.infer<typeof zMcpToolGetSkillsOutput>;
