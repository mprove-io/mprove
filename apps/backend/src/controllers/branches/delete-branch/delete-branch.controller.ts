import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteBranchRequestDto,
  ToBackendDeleteBranchResponseDto
} from '#backend/controllers/branches/delete-branch/delete-branch.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { BackendDefaultBranchCannotBeDeletedError } from '#common/types/backend/errors/backend-default-branch-cannot-be-deleted-error';
import type { BackendSessionBranchCannotBeDeletedError } from '#common/types/backend/errors/backend-session-branch-cannot-be-deleted-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteBranchOutput } from '#common/types/backend/routes/branches/delete-branch/delete-branch-output';

@ApiTags('Branches')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteBranchController {
  constructor(
    private projectsService: ProjectsService,
    private rpcService: RpcService,
    private sessionsService: SessionsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteBranch' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteBranch',
    description: 'Delete a branch'
  })
  @ApiOkResponse({
    type: ToBackendDeleteBranchResponseDto
  })
  async deleteBranch(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteBranchRequestDto
  ): Promise<BackendResultForOperation<'deleteBranch'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        traceId: body.traceId,
        userId: user.userId
      }),
      Result.bind('repoType', v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.andThrough(v =>
        v.repoType === 'session'
          ? Result.fail({
              code: 'BACKEND_SESSION_BRANCH_CANNOT_BE_DELETED'
            } satisfies BackendSessionBranchCannotBeDeletedError)
          : Result.succeed()
      ),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.membersService.getMemberCheckIsEditor({
          memberId: v.userId,
          projectId: v.projectId
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
        v.branchId === v.project.defaultBranch
          ? Result.fail({
              code: 'BACKEND_DEFAULT_BRANCH_CANNOT_BE_DELETED'
            } satisfies BackendDefaultBranchCannotBeDeletedError)
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'deleteBranch',
            traceId: v.traceId,
            input: {
              baseProject: this.db.projectTabToBaseProject({
                project: v.project
              }),
              repoId: v.repoId,
              branch: v.branchId
            }
          }
        })
      ),
      Result.andThrough(async v => {
        await retry(
          async () =>
            await this.db.drizzle.transaction(async tx => {
              await tx
                .delete(branchesTable)
                .where(
                  and(
                    eq(branchesTable.projectId, v.projectId),
                    eq(branchesTable.repoId, v.repoId),
                    eq(branchesTable.branchId, v.branchId)
                  )
                );

              await tx
                .delete(bridgesTable)
                .where(
                  and(
                    eq(bridgesTable.projectId, v.projectId),
                    eq(bridgesTable.repoId, v.repoId),
                    eq(bridgesTable.branchId, v.branchId)
                  )
                );
            }),
          getRetryOption(this.cs, this.logger)
        );
        return Result.succeed();
      }),
      Result.map((v): ToBackendDeleteBranchOutput => ({}))
    );
  }
}
