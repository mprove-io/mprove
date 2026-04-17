import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendIsBranchExistRequestDto,
  ToBackendIsBranchExistResponseDto
} from '#backend/controllers/branches/is-branch-exist/is-branch-exist.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { TabService } from '#backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ToBackendIsBranchExistResponsePayload } from '#common/zod/to-backend/branches/to-backend-is-branch-exist';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendIsBranchExist)
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
    let { projectId, branchId, repoId } = body.payload;

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

    let payload: ToBackendIsBranchExistResponsePayload = {
      isExist: isDefined(branch)
    };

    return payload;
  }
}
