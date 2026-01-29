import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import { PROD_REPO_ID } from '#common/constants/top';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetBranchesListRequest,
  ToBackendGetBranchesListResponsePayload
} from '#common/interfaces/to-backend/branches/to-backend-get-branches-list';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetBranchesListController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetBranchesList)
  async getBranchesList(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetBranchesListRequest = request.body;

    let { projectId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      memberId: user.userId,
      projectId: projectId
    });

    let branches = await this.db.drizzle.query.branchesTable.findMany({
      where: and(
        eq(branchesTable.projectId, projectId),
        inArray(branchesTable.repoId, [PROD_REPO_ID, user.userId])
      ),
      orderBy: asc(branchesTable.branchId)
    });

    let apiMember = this.membersService.tabToApi({
      member: userMember
    });

    let payload: ToBackendGetBranchesListResponsePayload = {
      userMember: apiMember,
      branchesList: branches.map(x => ({
        branchId: x.branchId,
        isRepoProd: x.repoId === PROD_REPO_ID
      }))
    };

    return payload;
  }
}
