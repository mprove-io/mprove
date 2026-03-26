import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RunQueriesService } from '#backend/controllers/queries/run-queries/run-queries.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendRunQueriesRequest,
  ToBackendRunQueriesResponsePayload
} from '#common/interfaces/to-backend/queries/to-backend-run-queries';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RunQueriesController {
  constructor(private runQueriesService: RunQueriesService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendRunQueries)
  async runQueries(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendRunQueriesRequest = request.body;

    let { projectId, repoId, branchId, envId, mconfigIds, poolSize } =
      reqValid.payload;

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
