import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetSkillsService } from '#backend/controllers/skills/get-skills/get-skills.service';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import {
  MCP_TOOL_GET_SKILLS,
  MCP_TOOL_GET_SKILLS_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { zodDeepNullish } from '#common/functions/zod-deep-nullish';
import { zodStripMcpSchemaId } from '#common/functions/zod-strip-mcp-schema-id';
import {
  type McpToolGetSkillsInput,
  zMcpToolGetSkillsInput,
  zMcpToolGetSkillsOutput
} from '#common/zod/to-backend/mcp-tools/mcp-tool-get-skills';

@Injectable()
@UseFilters(McpExceptionFilter)
export class GetSkillsTool {
  constructor(private getSkillsService: GetSkillsService) {}

  @Tool({
    name: MCP_TOOL_GET_SKILLS,
    description: MCP_TOOL_GET_SKILLS_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolGetSkillsInput }),
    outputSchema: zodStripMcpSchemaId({
      schema: zodDeepNullish({ schema: zMcpToolGetSkillsOutput })
    })
  })
  async getSkills(
    item: McpToolGetSkillsInput,
    context: Context,
    request: Request
  ) {
    return await this.getSkillsService.getSkills();
  }
}
