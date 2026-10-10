import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendValidateFilesRequestDto,
  ToBackendValidateFilesResponseDto
} from '#backend/controllers/files/validate-files/validate-files.dto';
import { ValidateFilesService } from '#backend/controllers/files/validate-files/validate-files.service';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

@ApiTags('Files')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ValidateFilesController {
  constructor(private validateFilesService: ValidateFilesService) {}

  @Post('api/ToBackendValidateFiles' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'validateFiles'>> {
    return this.validateFilesService.validateFilesResult({
      ...body.input,
      traceId: body.traceId,
      userId: user.userId
    });
  }
}
