import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendDeleteReportRequestDto,
  ToBackendDeleteReportResponseDto
} from '#backend/controllers/reports/delete-report/delete-report.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { reportsTable } from '#backend/drizzle/postgres/tables/reports';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkRepoId } from '#backend/functions/check-repo-id/check-repo-id';
import { getBranchBridgesForRebuild } from '#backend/functions/db/bridges/get-branch-bridges-for-rebuild/get-branch-bridges-for-rebuild';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { checkProjectIsNotRestricted } from '#backend/functions/db/projects/check-project-is-not-restricted/check-project-is-not-restricted';
import { projectTabToBaseProject } from '#backend/functions/db/projects/project-tab-to-base-project/project-tab-to-base-project';
import { getReportCheckExistsAndAccess } from '#backend/functions/db/reports/get-report-check-exists-and-access/get-report-check-exists-and-access';
import { getReportsCatalog } from '#backend/functions/db/reports/get-reports-catalog/get-reports-catalog';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteReportOutput } from '#common/types/backend/routes/reports/delete-report/delete-report-output';

@ApiTags('Reports')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteReportController {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteReport' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteReport',
    description: 'Delete a report'
  })
  @ApiOkResponse({
    type: ToBackendDeleteReportResponseDto
  })
  async deleteRep(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteReportRequestDto
  ): Promise<BackendResultForOperation<'deleteReport'>> {
    return Result.pipe(
      Result.succeed({
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        reportId: body.input.reportId,
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
      Result.andThrough(v =>
        checkProjectIsNotRestricted({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: v.repoId,
          cs: this.cs
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
          member: v.userMember
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
      Result.bind('existingReport', v =>
        getReportCheckExistsAndAccess({
          projectId: v.projectId,
          structId: v.bridge.structId,
          reportId: v.reportId,
          userMember: v.userMember,
          user: v.user,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'deleteFile',
            traceId: v.traceId,
            input: {
              baseProject: projectTabToBaseProject({
                tabService: this.tabService,
                project: v.project
              }),
              repoId: v.repoId,
              branch: v.branchId,
              fileNodeId: v.existingReport.filePath,
              userAlias: v.user.alias
            }
          }
        })
      ),
      Result.bind('branchBridges', v =>
        getBranchBridgesForRebuild({
          db: this.db,
          projectId: v.branch.projectId,
          repoId: v.branch.repoId,
          branchId: v.branch.branchId,
          envId: v.envId
        })
      ),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(async tx => {
                  await tx
                    .delete(reportsTable)
                    .where(
                      and(
                        eq(reportsTable.reportId, v.reportId),
                        eq(reportsTable.structId, v.bridge.structId)
                      )
                    );

                  await this.db.txWriteUnwrap({
                    tx: tx,
                    insertOrUpdate: { bridges: [...v.branchBridges] }
                  });
                }),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.bind('apiUserMember', v =>
        Result.succeed(
          memberTabToApi({
            member: v.userMember
          })
        )
      ),
      Result.bind('reportsCatalog', v =>
        getReportsCatalog({
          projectId: v.projectId,
          structId: v.bridge.structId,
          user: v.user,
          userMember: v.userMember,
          apiUserMember: v.apiUserMember,
          spaces: v.struct.spaces,
          db: this.db
        })
      ),
      Result.map(
        (v): ToBackendDeleteReportOutput => ({
          reportUnitDrafts: v.reportsCatalog.reportUnitDrafts,
          reportSpaceNodes: v.reportsCatalog.reportSpaceNodes
        })
      )
    );
  }
}
