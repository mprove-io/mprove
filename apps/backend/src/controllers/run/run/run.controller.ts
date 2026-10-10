import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendRunRequestDto,
  ToBackendRunResponseDto
} from '#backend/controllers/run/run/run.dto';
import { RunService } from '#backend/controllers/run/run/run.service';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendRunOutput } from '#common/types/backend/routes/run/run/run-output';

@ApiTags('Run')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RunController {
  constructor(private runService: RunService) {}

  @Post('api/ToBackendRun' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'Run',
    description: 'Run dashboards, charts, and reports in batch'
  })
  @ApiOkResponse({
    type: ToBackendRunResponseDto
  })
  async run(@AttachUser() user: UserTab, @Body() body: ToBackendRunRequestDto) {
    let payload: ToBackendRunOutput = await this.runService.run({
      ...body.input,
      traceId: body.traceId,
      user: user
    });

    return payload;
  }
}
