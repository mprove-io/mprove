import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  ToBackendCommitRepoRequestDto,
  ToBackendCommitRepoResponseDto
} from '#backend/controllers/repos/commit-repo/commit-repo.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  MemberTab,
  ProjectTab,
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { SessionArchiveService } from '#backend/services/session/session-archive/session-archive.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ArchiveSessionResultError } from '#common/types/backend/function-errors/archive-session-result-error';
import type { CheckRepoIdResultError } from '#common/types/backend/function-errors/check-repo-id-result-error';
import type { GetMemberCheckIsEditorResultError } from '#common/types/backend/function-errors/get-member-check-is-editor-result-error';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { GetSessionByIdCheckExistsResultError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-result-error';
import type { SendToDiskResultError } from '#common/types/backend/function-errors/send-to-disk-result-error';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCommitRepoOutput } from '#common/types/backend/routes/repos/commit-repo/commit-repo-output';
import type { RepoType } from '#common/types/disk/parts/repo/repo-type';
import type { ToDiskCommitRepoOutput } from '#common/types/disk/routes/repos/commit-repo/commit-repo-output';

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
    private branchesService: BranchesService,
    private sessionArchiveService: SessionArchiveService
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
      Result.bind(
        'repoType',
        (v): Result.ResultAsync<RepoType, CheckRepoIdResultError> =>
          this.sessionsService.checkRepoIdResult({
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
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsResultError> =>
          this.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsEditorResultError> =>
          this.membersService.getMemberCheckIsEditorResult({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.andThrough(v =>
        this.projectsService.checkProjectIsNotRestrictedResult({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: v.repoId
        })
      ),
      Result.andThrough(v =>
        this.branchesService.getBranchCheckExistsResult({
          projectId: v.projectId,
          repoId: v.repoId,
          branchId: v.branchId
        })
      ),
      Result.bind(
        'diskCommitRepoOutput',
        (
          v
        ): Result.ResultAsync<ToDiskCommitRepoOutput, SendToDiskResultError> =>
          this.rpcService.sendToDiskResult({
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
      Result.bind(
        'session',
        async (
          v
        ): Result.ResultAsync<
          SessionTab,
          GetSessionByIdCheckExistsResultError
        > =>
          v.repoType !== 'session'
            ? Result.succeed(undefined)
            : this.sessionsService.getSessionByIdCheckExistsResult({
                sessionId: v.repoId
              })
      ),
      Result.bind(
        'apiSession',
        async (v): Result.ResultAsync<SessionApi, ArchiveSessionResultError> =>
          isUndefined(v.session)
            ? Result.succeed(undefined)
            : this.sessionArchiveService.archiveSessionResult({
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
