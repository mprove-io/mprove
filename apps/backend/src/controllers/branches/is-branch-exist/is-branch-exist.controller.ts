import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendIsBranchExistRequestDto,
  ToBackendIsBranchExistResponseDto
} from '#backend/controllers/branches/is-branch-exist/is-branch-exist.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { TabService } from '#backend/services/tab.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendIsBranchExistOutput } from '#common/zod/backend/routes/branches/is-branch-exist/is-branch-exist-response';

@ApiTags('Branches')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class IsBranchExistController {
  constructor(
    private tabService: TabService,
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
  ) {
    let { projectId, branchId, repoId } = body.input;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId,
      allowProdRepo: true
    });

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckExists({
      memberId: user.userId,
      projectId: projectId
    });

    let branch = await this.db.drizzle.query.branchesTable.findFirst({
      where: and(
        eq(branchesTable.projectId, projectId),
        eq(branchesTable.repoId, repoId),
        eq(branchesTable.branchId, branchId)
      )
    });

    let payload: ToBackendIsBranchExistOutput = {
      isExist: isDefined(branch)
    };

    return payload;
  }
}
