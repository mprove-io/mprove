import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendRunQueriesRequestDto,
  ToBackendRunQueriesResponseDto
} from '#backend/controllers/queries/run-queries/run-queries.dto';
import { RunQueriesService } from '#backend/controllers/queries/run-queries/run-queries.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendRunQueriesOutput } from '#common/types/backend/routes/queries/run-queries/run-queries-output';

@ApiTags('Queries')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RunQueriesController {
  constructor(private runQueriesService: RunQueriesService) {}

  @Post('api/ToBackendRunQueries' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'RunQueries',
    description: 'Run queries for specified mconfigs'
  })
  @ApiOkResponse({
    type: ToBackendRunQueriesResponseDto
  })
  async runQueries(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendRunQueriesRequestDto
  ) {
    let { projectId, repoId, branchId, envId, mconfigIds, poolSize } =
      body.input;

    let payload: ToBackendRunQueriesOutput =
      await this.runQueriesService.runQueries({
        user: user,
        projectId: projectId,
        repoId: repoId,
        branchId: branchId,
        envId: envId,
        mconfigIds: mconfigIds,
        poolSize: poolSize
      });

    return payload;
  }
}
