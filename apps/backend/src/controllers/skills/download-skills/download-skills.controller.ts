import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendDownloadSkillsRequestDto,
  ToBackendDownloadSkillsResponseDto
} from '#backend/controllers/skills/download-skills/download-skills.dto';
import { SkillsService } from '#backend/controllers/skills/download-skills/download-skills.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendDownloadSkillsResponsePayload } from '#common/zod/to-backend/skills/to-backend-download-skills';

@ApiTags('Skills')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DownloadSkillsController {
  constructor(private skillsService: SkillsService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDownloadSkills)
  @ApiOperation({
    summary: 'DownloadSkills',
    description: 'Download the MCP skills'
  })
  @ApiOkResponse({
    type: ToBackendDownloadSkillsResponseDto
  })
  async downloadSkills(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDownloadSkillsRequestDto
  ) {
    let payload: ToBackendDownloadSkillsResponsePayload =
      await this.skillsService.downloadSkills();

    return payload;
  }
}
