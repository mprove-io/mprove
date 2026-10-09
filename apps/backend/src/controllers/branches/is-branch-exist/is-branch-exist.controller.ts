import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendIsBranchExistRequestDto,
  ToBackendIsBranchExistResponseDto
} from '#backend/controllers/branches/is-branch-exist/is-branch-exist.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BranchEnt,
  branchesTable
} from '#backend/drizzle/postgres/schema/branches';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendIsBranchExistOutput } from '#common/types/backend/routes/branches/is-branch-exist/is-branch-exist-output';

@ApiTags('Branches')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class IsBranchExistController {
  constructor(
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private membersService: MembersService,
    @Inject(DRIZZLE) private db: Db
  ) {}

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
        this.sessionsService.checkRepoIdResult({
          repoId: v.repoId,
          userId: v.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckExistsResult({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'branchEnt',
        (v): Result.ResultAsync<BranchEnt, never> =>
          this.db.drizzle.query.branchesTable
            .findFirst({
              where: and(
                eq(branchesTable.projectId, v.projectId),
                eq(branchesTable.repoId, v.repoId),
                eq(branchesTable.branchId, v.branchId)
              )
            })
            .then(branchEnt => Result.succeed(branchEnt))
      ),
      Result.map(
        (v): ToBackendIsBranchExistOutput => ({
          isExist: isDefined(v.branchEnt)
        })
      )
    );
  }
}
