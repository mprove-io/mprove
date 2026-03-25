import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ValidateFilesService } from '#backend/controllers/files/validate-files/validate-files.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendValidateFilesRequest } from '#common/interfaces/to-backend/files/to-backend-validate-files';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ValidateFilesController {
  constructor(private validateFilesService: ValidateFilesService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendValidateFiles)
  async saveFile(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendValidateFilesRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, repoId, envId, branchId } = reqValid.payload;

    let payload = await this.validateFilesService.validateFiles({
      traceId: traceId,
      userId: user.userId,
      projectId: projectId,
      repoId: repoId,
      branchId: branchId,
      envId: envId
    });

    return payload;
  }
}
