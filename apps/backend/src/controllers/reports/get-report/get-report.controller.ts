import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendGetReportRequestDto,
  ToBackendGetReportResponseDto
} from '#backend/controllers/reports/get-report/get-report.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { EnvTab, UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { getQueryInfoReportData } from '#backend/functions/db/reports/get-query-info-report-data/get-query-info-report-data';
import { checkRepoId } from '#backend/functions/db/sessions/check-repo-id/check-repo-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { CalcDbService } from '#backend/services/calc-db/calc-db.service';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
import type { GetEnvCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

@ApiTags('Reports')
@UseGuards(ThrottlerUserIdGuard)
// reports.component.ts -> startCheckRunning()
@Throttle({
  '1s': {
    limit: 3 * THROTTLE_MULTIPLIER * 1.5
  },
  '5s': {
    limit: 5 * THROTTLE_MULTIPLIER * 1.5
  },
  '60s': {
    limit: (60 / 2) * THROTTLE_MULTIPLIER * 1.5
  },
  '600s': {
    limit: 10 * (60 / 2) * THROTTLE_MULTIPLIER * 1.5,
    blockDuration: seconds(12 * 60 * 60)
  }
})
@Controller()
export class GetReportController {
  constructor(
    private db: DbService,
    private cs: ConfigService<BackendConfig>,
    private calcDbService: CalcDbService,
    private logger: Logger
  ) {}

  @Post('api/ToBackendGetReport' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetReport',
    description: 'Get a report'
  })
  @ApiOkResponse({
    type: ToBackendGetReportResponseDto
  })
  async getRep(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetReportRequestDto
  ): Promise<BackendResultForOperation<'getReport'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        reportId: body.input.reportId,
        timeRangeFractionBrick: body.input.timeRangeFractionBrick,
        timeSpec: body.input.timeSpec,
        timezone: body.input.timezone
      }),
      Result.andThrough(v =>
        checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true,
          db: this.db
        })
      ),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('branch', v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.repoId),
            eq(branchesTable.branchId, v.branchId)
          )
        })
      ),
      Result.andThrough(async v => {
        let envAccessResult: Result.Result<
          EnvTab,
          GetEnvCheckExistsAndAccessError
        > = await getEnvCheckExistsAndAccess({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        });

        if (Result.isFailure(envAccessResult)) {
          return envAccessResult;
        }

        return Result.succeed();
      }),
      Result.bind('bridge', v =>
        this.db.bridges.findFirstCheckExists({
          where: and(
            eq(bridgesTable.projectId, v.branch.projectId),
            eq(bridgesTable.repoId, v.branch.repoId),
            eq(bridgesTable.branchId, v.branch.branchId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.andThen(v =>
        getQueryInfoReportData({
          traceId: v.traceId,
          user: v.user,
          userMember: v.userMember,
          project: v.project,
          bridge: v.bridge,
          projectId: v.projectId,
          envId: v.envId,
          reportId: v.reportId,
          timezone: v.timezone,
          timeSpec: v.timeSpec,
          timeRangeFractionBrick: v.timeRangeFractionBrick,
          skipUi: false,
          db: this.db,
          cs: this.cs,
          calcDb: this.calcDbService.calcDb,
          logger: this.logger
        })
      )
    );
  }
}
