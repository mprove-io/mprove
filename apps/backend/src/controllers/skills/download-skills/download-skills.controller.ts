import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { DownloadSkillsService } from '#backend/controllers/skills/download-skills/download-skills.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ToBackendDownloadSkillsRequest,
  ToBackendDownloadSkillsResponsePayload
} from '#common/interfaces/to-backend/skills/to-backend-download-skills';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DownloadSkillsController {
  constructor(private downloadSkillsService: DownloadSkillsService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDownloadSkills)
  async downloadSkills(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendDownloadSkillsRequest = request.body;

    let payload: ToBackendDownloadSkillsResponsePayload =
      await this.downloadSkillsService.downloadSkills();

    return payload;
  }
}
