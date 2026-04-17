import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendValidateFilesRequestDto,
  ToBackendValidateFilesResponseDto
} from '#backend/controllers/files/validate-files/validate-files.dto';
import { ValidateFilesService } from '#backend/controllers/files/validate-files/validate-files.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';

@ApiTags('Files')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ValidateFilesController {
  constructor(private validateFilesService: ValidateFilesService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendValidateFiles)
  @ApiOperation({
    summary: 'ValidateFiles',
    description: 'Validate repository files and rebuild state'
  })
  @ApiOkResponse({
    type: ToBackendValidateFilesResponseDto
  })
  async saveFile(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendValidateFilesRequestDto
  ) {
    let { traceId } = body.info;
    let { projectId, repoId, envId, branchId } = body.payload;

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
