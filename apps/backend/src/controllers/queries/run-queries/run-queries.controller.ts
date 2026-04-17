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
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendRunQueriesResponsePayload } from '#common/zod/to-backend/queries/to-backend-run-queries';

@ApiTags('Queries')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RunQueriesController {
  constructor(private runQueriesService: RunQueriesService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendRunQueries)
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
      body.payload;

    let payload: ToBackendRunQueriesResponsePayload =
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
