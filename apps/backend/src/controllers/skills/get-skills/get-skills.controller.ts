import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  ToBackendGetSkillsRequestDto,
  ToBackendGetSkillsResponseDto
} from '#backend/controllers/skills/get-skills/get-skills.dto';
import { GetSkillsService } from '#backend/controllers/skills/get-skills/get-skills.service';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetSkillsOutput } from '#common/types/backend/routes/skills/get-skills/get-skills-output';

@ApiTags('Skills')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetSkillsController {
  constructor(private getSkillsService: GetSkillsService) {}

  @Post('api/ToBackendGetSkills' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'getSkills'>> {
    let payload: ToBackendGetSkillsOutput =
      await this.getSkillsService.getSkills();

    return Result.succeed(payload);
  }
}
