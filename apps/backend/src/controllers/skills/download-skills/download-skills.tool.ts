import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { z } from 'zod';
import { DownloadSkillsService } from '#backend/controllers/skills/download-skills/download-skills.service';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { MCP_TOOL_DOWNLOAD_SKILLS } from '#common/constants/top-backend';

@Injectable()
@UseFilters(McpExceptionFilter)
export class DownloadSkillsTool {
  constructor(private downloadSkillsService: DownloadSkillsService) {}

  @Tool({
    name: MCP_TOOL_DOWNLOAD_SKILLS,
    description: 'Download all available mprove skills',
    parameters: z.object({}),
    outputSchema: z.object({
      skillItems: z.array(
        z.object({
          name: z.string().nullish(),
          content: z.string().nullish()
        })
      )
    })
  })
  async downloadSkills(
    item: Record<string, never>,
    context: Context,
    request: Request
  ) {
    return await this.downloadSkillsService.downloadSkills();
  }
}
