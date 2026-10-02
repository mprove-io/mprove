import { UseFilters } from '@nestjs/common';
import { McpController, Tool } from '@rekog/mcp-nest';
import { GetSkillsService } from '#backend/controllers/skills/get-skills/get-skills.service';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema';
import { zodStripMcpSchemaId } from '#backend/functions/zod-strip-mcp-schema-id';
import {
  MCP_TOOL_GET_SKILLS,
  MCP_TOOL_GET_SKILLS_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { zMcpToolGetSkillsInput } from '#common/types/backend/mcp-tools/mcp-tool-get-skills/mcp-tool-get-skills-input';
import { zMcpToolGetSkillsOutput } from '#common/types/backend/mcp-tools/mcp-tool-get-skills/mcp-tool-get-skills-output';

@McpController()
@UseFilters(McpExceptionFilter)
export class GetSkillsTool {
  constructor(private getSkillsService: GetSkillsService) {}

  @Tool({
    name: MCP_TOOL_GET_SKILLS,
    description: MCP_TOOL_GET_SKILLS_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolGetSkillsInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolGetSkillsOutput
    })
  })
  async getSkills() {
    return await this.getSkillsService.getSkills();
  }
}
