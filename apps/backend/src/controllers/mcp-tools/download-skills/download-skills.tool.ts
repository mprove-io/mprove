import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { SkillsService } from '#backend/controllers/skills/download-skills/download-skills.service';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { MCP_TOOL_DOWNLOAD_SKILLS } from '#common/constants/top-backend';
import { zodDeepNullish } from '#common/functions/zod-deep-nullish';
import {
  type McpToolDownloadSkillsInput,
  zMcpToolDownloadSkillsInput,
  zMcpToolDownloadSkillsOutput
} from '#common/zod/to-backend/skills/mcp-tool-download-skills';

@Injectable()
@UseFilters(McpExceptionFilter)
export class DownloadSkillsTool {
  constructor(private skillsService: SkillsService) {}

  @Tool({
    name: MCP_TOOL_DOWNLOAD_SKILLS,
    description: 'Download all available mprove skills',
    parameters: zMcpToolDownloadSkillsInput,
    outputSchema: zodDeepNullish({ schema: zMcpToolDownloadSkillsOutput })
  })
  async downloadSkills(
    item: McpToolDownloadSkillsInput,
    context: Context,
    request: Request
  ) {
    return await this.skillsService.downloadSkills();
  }
}
