import { z } from 'zod';
import { zSkillItem } from '#common/zod/backend/skill-item';

export let zMcpToolDownloadSkillsInput = z
  .object({})
  .meta({ id: 'McpToolDownloadSkillsInput' });

export let zMcpToolDownloadSkillsOutput = z
  .object({
    skillItems: z.array(zSkillItem)
  })
  .meta({ id: 'McpToolDownloadSkillsOutput' });

export type McpToolDownloadSkillsInput = z.infer<
  typeof zMcpToolDownloadSkillsInput
>;

export type McpToolDownloadSkillsOutput = z.infer<
  typeof zMcpToolDownloadSkillsOutput
>;
