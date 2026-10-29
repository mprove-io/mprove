import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendDeleteDraftReportsRequestDto,
  ToBackendDeleteDraftReportsResponseDto
} from '#backend/controllers/reports/delete-draft-reports/delete-draft-reports.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { reportsTable } from '#backend/drizzle/postgres/tables/reports';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getReportsCatalog } from '#backend/functions/db/reports/get-reports-catalog/get-reports-catalog';
import { checkRepoId } from '#backend/functions/db/sessions/check-repo-id/check-repo-id';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteDraftReportsOutput } from '#common/types/backend/routes/reports/delete-draft-reports/delete-draft-reports-output';

@ApiTags('Reports')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteDraftReportsController {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteDraftReports' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteDraftReports',
    description: "Delete the user's draft reports"
  })
  @ApiOkResponse({
    type: ToBackendDeleteDraftReportsResponseDto
  })
  async deleteDraftReports(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteDraftReportsRequestDto
  ): Promise<BackendResultForOperation<'deleteDraftReports'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        reportIds: body.input.reportIds,
        user: user
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
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('member', v =>
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
      Result.andThrough(v =>
        getEnvCheckExistsAndAccess({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId,
          member: v.member
        })
      ),
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
      Result.bind('struct', v =>
        getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId,
          cs: this.cs,
          db: this.db
        })
      ),
      Result.andThrough(async v => {
        await retry(
          async () =>
            await this.db.drizzle.transaction(async tx => {
              await tx
                .delete(reportsTable)
                .where(
                  and(
                    inArray(reportsTable.reportId, v.reportIds),
                    eq(reportsTable.projectId, v.projectId),
                    eq(reportsTable.draft, true),
                    eq(reportsTable.creatorId, v.user.userId),
                    eq(reportsTable.structId, v.bridge.structId)
                  )
                );
            }),
          getRetryOption(this.cs, this.logger)
        );
        return Result.succeed();
      }),
      Result.bind('apiUserMember', v =>
        Result.succeed(
          memberTabToApi({
            member: v.member
          })
        )
      ),
      Result.bind('reportsCatalog', v =>
        getReportsCatalog({
          projectId: v.projectId,
          structId: v.bridge.structId,
          user: v.user,
          userMember: v.member,
          apiUserMember: v.apiUserMember,
          spaces: v.struct.spaces,
          db: this.db
        })
      ),
      Result.map(
        (v): ToBackendDeleteDraftReportsOutput => ({
          reportUnitDrafts: v.reportsCatalog.reportUnitDrafts
        })
      )
    );
  }
}
