import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetQueryInfoRequestDto,
  ToBackendGetQueryInfoResponseDto
} from '#backend/controllers/queries/get-query-info/get-query-info.dto';
import { GetQueryInfoService } from '#backend/controllers/queries/get-query-info/get-query-info.service';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetQueryInfoOutput } from '#common/types/backend/routes/query-info/get-query-info/get-query-info-output';

@ApiTags('Queries')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetQueryInfoController {
  constructor(private getQueryInfoService: GetQueryInfoService) {}

  @Post('api/ToBackendGetQueryInfo' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetQueryInfo',
    description: 'Get Malloy, SQL, and data'
  })
  @ApiOkResponse({
    type: ToBackendGetQueryInfoResponseDto
  })
  async getQueryInfo(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetQueryInfoRequestDto
  ) {
    let payload: ToBackendGetQueryInfoOutput =
      await this.getQueryInfoService.getQueryInfo({
        ...body.input,
        traceId: body.traceId,
        user: user
      });

    return payload;
  }
}
