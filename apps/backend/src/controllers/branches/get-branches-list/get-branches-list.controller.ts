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
import { SessionsService } from '#backend/services/db/sessions.service';
import { TabService } from '#backend/services/tab.service';
import { PROD_REPO_ID } from '#common/constants/top';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
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
    private sessionsService: SessionsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetBranchesList)
  async getBranchesList(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetBranchesListRequest = request.body;

    let { projectId, sessionRepoId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      memberId: user.userId,
      projectId: projectId
    });

    let repoIds = [PROD_REPO_ID, user.userId];

    if (isDefined(sessionRepoId)) {
      await this.sessionsService.checkRepoId({
        repoId: sessionRepoId,
        userId: user.userId,
        projectId: projectId
      });
      repoIds.push(sessionRepoId);
    }

    let branches = await this.db.drizzle.query.branchesTable.findMany({
      where: and(
        eq(branchesTable.projectId, projectId),
        inArray(branchesTable.repoId, repoIds)
      ),
      orderBy: asc(branchesTable.branchId)
    });

    let apiMember = this.membersService.tabToApi({
      member: userMember
    });

    let payload: ToBackendGetBranchesListResponsePayload = {
      userMember: apiMember,
      branchesList: branches.map(x => ({
        repoId: x.repoId,
        repoType:
          x.repoId === PROD_REPO_ID
            ? RepoTypeEnum.Prod
            : isDefined(sessionRepoId) && x.repoId === sessionRepoId
              ? RepoTypeEnum.Session
              : RepoTypeEnum.Dev,
        branchId: x.branchId
      }))
    };

    return payload;
  }
}
