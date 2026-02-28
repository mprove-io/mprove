import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { PROD_REPO_ID } from '#common/constants/top';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetBranchesListRequest,
  ToBackendGetBranchesListResponsePayload
} from '#common/interfaces/to-backend/branches/to-backend-get-branches-list';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetBranchesListController {
  constructor(
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

    let sessions = await this.db.drizzle
      .select({ repoId: sessionsTable.repoId })
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.userId, user.userId),
          eq(sessionsTable.projectId, projectId)
        )
      );

    let sessionRepoIds = sessions.map(s => s.repoId);

    let repoIds = [PROD_REPO_ID, user.userId, ...sessionRepoIds];

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

    let seen: Record<string, boolean> = {};

    let uniqueBranches = branches.filter(x => {
      let key = `${x.repoId}::${x.branchId}`;
      if (seen[key]) {
        return false;
      }
      seen[key] = true;
      return true;
    });

    let payload: ToBackendGetBranchesListResponsePayload = {
      userMember: apiMember,
      branchesList: uniqueBranches.map(x => ({
        repoId: x.repoId,
        repoType:
          x.repoId === PROD_REPO_ID
            ? RepoTypeEnum.Prod
            : x.repoId === user.userId
              ? RepoTypeEnum.Dev
              : RepoTypeEnum.Session,
        branchId: x.branchId
      }))
    };

    return payload;
  }
}
