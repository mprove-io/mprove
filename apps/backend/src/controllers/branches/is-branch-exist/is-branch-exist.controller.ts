import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ToBackendIsBranchExistRequestDto,
  ToBackendIsBranchExistResponseDto
} from '#backend/controllers/branches/is-branch-exist/is-branch-exist.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendIsBranchExistOutput } from '#common/types/backend/routes/branches/is-branch-exist/is-branch-exist-output';

@ApiTags('Branches')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class IsBranchExistController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendIsBranchExist' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'IsBranchExist',
    description: 'Check whether a branch exists in a project repo'
  })
  @ApiOkResponse({
    type: ToBackendIsBranchExistResponseDto
  })
  async isBranchExist(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendIsBranchExistRequestDto
  ): Promise<BackendResultForOperation<'isBranchExist'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        branchId: body.input.branchId,
        repoId: body.input.repoId,
        userId: user.userId
      }),
      Result.andThrough(v =>
        checkRepoId({
          repoId: v.repoId,
          userId: v.userId,
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
      Result.andThrough(v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('isBranchExist', v =>
        this.db.branches.isExist({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.repoId),
            eq(branchesTable.branchId, v.branchId)
          )
        })
      ),
      Result.map(
        (v): ToBackendIsBranchExistOutput => ({
          isExist: v.isBranchExist
        })
      )
    );
  }
}
