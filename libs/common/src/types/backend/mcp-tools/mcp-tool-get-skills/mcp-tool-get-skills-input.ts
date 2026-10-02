import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type McpToolGetSkillsInput = Record<string, never>;

export let zMcpToolGetSkillsInput = z
  .object({})
  .meta({ id: 'McpToolGetSkillsInput' });

assertTypesEqual<McpToolGetSkillsInput, z.infer<typeof zMcpToolGetSkillsInput>>(
  { value: true }
);
