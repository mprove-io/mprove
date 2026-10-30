import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendCommitRepoRequestDto,
  ToBackendCommitRepoResponseDto
} from '#backend/controllers/repos/commit-repo/commit-repo.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { sessionsTable } from '#backend/drizzle/postgres/tables/sessions';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getMemberCheckIsEditor } from '#backend/functions/db/members/get-member-check-is-editor/get-member-check-is-editor';
import { checkProjectIsNotRestricted } from '#backend/functions/db/projects/check-project-is-not-restricted/check-project-is-not-restricted';
import { projectTabToBaseProject } from '#backend/functions/db/projects/project-tab-to-base-project/project-tab-to-base-project';
import { archiveSession } from '#backend/functions/db/sessions/archive-session/archive-session';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import { EditorSessionLockService } from '#backend/services/editor/editor-session-lock/editor-session-lock.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
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
    private rpcService: RpcService,
    private db: DbService,
    private cs: ConfigService<BackendConfig>,
    private editorSessionLockService: EditorSessionLockService,
    private editorSandboxService: EditorSandboxService,
    private editorStreamService: EditorStreamService,
    private logger: Logger
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
        checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true,
          db: this.db
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
        getMemberCheckIsEditor({
          projectId: v.projectId,
          memberId: v.user.userId,
          db: this.db
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
              baseProject: projectTabToBaseProject({
                tabService: this.tabService,
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
          : archiveSession({
              session: v.session,
              archiveReason: 'Commit',
              e2bApiKey: v.project.e2bApiKey,
              editorSessionLockService: this.editorSessionLockService,
              db: this.db,
              editorSandboxService: this.editorSandboxService,
              editorStreamService: this.editorStreamService,
              logger: this.logger,
              cs: this.cs
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
