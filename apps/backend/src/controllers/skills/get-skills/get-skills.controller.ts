import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetSkillsRequestDto,
  ToBackendGetSkillsResponseDto
} from '#backend/controllers/skills/get-skills/get-skills.dto';
import { GetSkillsService } from '#backend/controllers/skills/get-skills/get-skills.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetSkillsResponsePayload } from '#common/zod/to-backend/skills/to-backend-get-skills';

@ApiTags('Skills')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetSkillsController {
  constructor(private getSkillsService: GetSkillsService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetSkills)
  @ApiOperation({
    summary: 'GetSkills',
    description: 'Get contents of Mprove SKILL.md files'
  })
  @ApiOkResponse({
    type: ToBackendGetSkillsResponseDto
  })
  async getSkills(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetSkillsRequestDto
  ) {
    let payload: ToBackendGetSkillsResponsePayload =
      await this.getSkillsService.getSkills();

    return payload;
  }
}
