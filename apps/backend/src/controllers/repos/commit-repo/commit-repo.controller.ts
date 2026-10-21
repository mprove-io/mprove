import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendCommitRepoRequestDto,
  ToBackendCommitRepoResponseDto
} from '#backend/controllers/repos/commit-repo/commit-repo.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { SessionArchiveService } from '#backend/services/session/session-archive/session-archive.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCommitRepoOutput } from '#common/types/backend/routes/repos/commit-repo/commit-repo-output';

@ApiTags('Repos')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CommitRepoController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private rpcService: RpcService,
    private sessionArchiveService: SessionArchiveService,
    private db: DbService
  ) {}

  @Post('api/ToBackendCommitRepo' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CommitRepo',
    description: 'Commit local changes in a repo branch'
  })
  @ApiOkResponse({
    type: ToBackendCommitRepoResponseDto
  })
  async commitRepo(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCommitRepoRequestDto
  ): Promise<BackendResultForOperation<'commitRepo'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        branchId: body.input.branchId,
        repoId: body.input.repoId,
        commitMessage: body.input.commitMessage,
        traceId: body.traceId,
        user: user
      }),
      Result.bind('repoType', v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.andThrough(v =>
        v.repoType === 'production'
          ? Result.fail({
              code: 'BACKEND_MANUAL_COMMIT_TO_PRODUCTION_REPO_IS_FORBIDDEN'
            })
          : Result.succeed()
      ),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.membersService.getMemberCheckIsEditor({
          projectId: v.projectId,
          memberId: v.user.userId
        })
      ),
      Result.andThrough(v =>
        this.projectsService.checkProjectIsNotRestricted({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: v.repoId
        })
      ),
      Result.andThrough(v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.repoId),
            eq(branchesTable.branchId, v.branchId)
          )
        })
      ),
      Result.bind('diskCommitRepoOutput', v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'commitRepo',
            traceId: v.traceId,
            input: {
              baseProject: this.tabService.projectTabToBaseProject({
                project: v.project
              }),
              repoId: v.repoId,
              branch: v.branchId,
              userAlias: v.user.alias,
              commitMessage: v.commitMessage
            }
          }
        })
      ),
      Result.bind('session', async v =>
        v.repoType !== 'session'
          ? Result.succeed(undefined)
          : this.db.sessions.findFirstCheckExists({
              where: eq(sessionsTable.sessionId, v.repoId)
            })
      ),
      Result.bind('apiSession', async v =>
        isUndefined(v.session)
          ? Result.succeed(undefined)
          : this.sessionArchiveService.archiveSession({
              session: v.session,
              archiveReason: 'Commit',
              e2bApiKey: v.project.e2bApiKey
            })
      ),
      Result.map(
        (v): ToBackendCommitRepoOutput => ({
          repo: v.diskCommitRepoOutput.repo,
          ...(v.repoType === 'session' ? { session: v.apiSession } : {})
        })
      )
    );
  }
}
