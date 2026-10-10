import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetConnectionSampleRequestDto,
  ToBackendGetConnectionSampleResponseDto
} from '#backend/controllers/connections/get-connection-sample/get-connection-sample.dto';
import { GetConnectionSampleService } from '#backend/controllers/connections/get-connection-sample/get-connection-sample.service';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetConnectionSampleController {
  constructor(private connectionSampleService: GetConnectionSampleService) {}

  @Post('api/ToBackendGetConnectionSample' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetConnectionSample',
    description: 'Get sample data'
  })
  @ApiOkResponse({
    type: ToBackendGetConnectionSampleResponseDto
  })
  async getConnectionSample(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetConnectionSampleRequestDto
  ): Promise<BackendResultForOperation<'getConnectionSample'>> {
    return this.connectionSampleService.getConnectionSampleResult({
      ...body.input,
      userId: user.userId
    });
  }
}
