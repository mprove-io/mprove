import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { TabService } from '#backend/services/tab.service';
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
    private sessionsService: SessionsService,
    private tabService: TabService,
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

    let sessionEnts = await this.db.drizzle.query.sessionsTable.findMany({
      where: and(
        eq(sessionsTable.userId, user.userId),
        eq(sessionsTable.projectId, projectId)
      )
    });

    let sessionRepoIds = sessionEnts.map(s => s.repoId);

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

    let sessionIds = sessionEnts.map(s => s.sessionId);

    let ocSessionEnts =
      sessionIds.length > 0
        ? await this.db.drizzle.query.ocSessionsTable.findMany({
            where: inArray(ocSessionsTable.sessionId, sessionIds)
          })
        : [];

    let ocSessionTabs = Object.fromEntries(
      ocSessionEnts.map(e => [
        e.sessionId,
        this.tabService.ocSessionEntToTab(e)
      ])
    );

    let sessionsList = sessionEnts.map(ent => {
      let session = this.tabService.sessionEntToTab(ent);
      let ocSession = ocSessionTabs[session.sessionId];
      return this.sessionsService.tabToSessionApi({ session, ocSession });
    });

    let payload: ToBackendGetBranchesListResponsePayload = {
      userMember: apiMember,
      sessionsList: sessionsList,
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
