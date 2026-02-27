import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { TabService } from '#backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ToBackendIsBranchExistRequest,
  ToBackendIsBranchExistResponsePayload
} from '#common/interfaces/to-backend/branches/to-backend-is-branch-exist';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
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
  async isBranchExist(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendIsBranchExistRequest = request.body;

    let { projectId, branchId, repoId } = reqValid.payload;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId
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
