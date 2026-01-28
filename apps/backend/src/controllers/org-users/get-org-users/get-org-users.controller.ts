import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  OrgUsersItem,
  ToBackendGetOrgUsersRequest,
  ToBackendGetOrgUsersResponsePayload
} from '#common/interfaces/to-backend/org-users/to-backend-get-org-users';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { Db, DRIZZLE } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import {
  AvatarEnt,
  avatarsTable
} from '~backend/drizzle/postgres/schema/avatars';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { makeFullName } from '~backend/functions/make-full-name';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/db/orgs.service';
import { TabService } from '~backend/services/tab.service';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetOrgUsersController {
  constructor(
    private tabService: TabService,
    private orgsService: OrgsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetOrgUsers)
  async getOrgUsers(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetOrgUsersRequest = request.body;

    let { orgId, perPage, pageNum } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
    });

    let projects = await this.db.drizzle.query.projectsTable
      .findMany({
        where: eq(projectsTable.orgId, orgId)
      })
      .then(xs => xs.map(x => this.tabService.projectEntToTab(x)));

    let projectIds = projects.map(x => x.projectId);

    let memberParts = await this.db.drizzle
      .select({
        memberId: sql<string>`DISTINCT ${membersTable.memberId}`
      })
      .from(membersTable)
      .where(inArray(membersTable.projectId, projectIds));

    let userIds = memberParts.map(x => x.memberId);

    let sortedUsers = await this.db.drizzle.query.usersTable
      .findMany({
        where: and(inArray(usersTable.userId, userIds))
      })
      .then(xs =>
        xs
          .map(x => this.tabService.userEntToTab(x))
          .sort((a, b) => (a.email > b.email ? 1 : b.email > a.email ? -1 : 0))
      );

    let offset = (pageNum - 1) * perPage;

    let users = sortedUsers.slice(offset, offset + perPage);

    let members =
      userIds.length === 0
        ? []
        : await this.db.drizzle.query.membersTable.findMany({
            where: and(
              inArray(membersTable.memberId, userIds),
              inArray(membersTable.projectId, projectIds)
            )
          });

    let orgUserItems: OrgUsersItem[] = [];

    let avatars =
      userIds.length === 0
        ? []
        : await this.db.drizzle
            .select({
              keyTag: avatarsTable.keyTag,
              userId: avatarsTable.userId,
              st: avatarsTable.st
            })
            .from(avatarsTable)
            .where(inArray(avatarsTable.userId, userIds))
            .then(xs =>
              xs.map(x => this.tabService.avatarEntToTab(x as AvatarEnt))
            );

    users.forEach(x => {
      let userMembers = members.filter(m => m.memberId === x.userId);

      let orgUserItem: OrgUsersItem = {
        userId: x.userId,
        avatarSmall: avatars.find(a => a.userId === x.userId)?.avatarSmall,
        email: x.email,
        alias: x.alias,
        firstName: x.firstName,
        lastName: x.lastName,
        fullName: makeFullName({
          firstName: x.firstName,
          lastName: x.lastName
        }),
        adminProjects: userMembers
          .filter(m => m.isAdmin === true)
          .map(m => m.projectId)
          .map(y => {
            let project = projects.find(p => p.projectId === y);
            return project.name;
          }),
        editorProjects: userMembers
          .filter(m => m.isEditor === true)
          .map(m => m.projectId)
          .map(y => {
            let project = projects.find(p => p.projectId === y);
            return project.name;
          }),
        explorerProjects: userMembers
          .filter(m => m.isExplorer === true)
          .map(m => m.projectId)
          .map(y => {
            let project = projects.find(p => p.projectId === y);
            return project.name;
          }),
        projectUserProjects: userMembers
          .map(m => m.projectId)
          .map(y => {
            let project = projects.find(p => p.projectId === y);
            return project.name;
          })
      };

      orgUserItems.push(orgUserItem);
    });

    let payload: ToBackendGetOrgUsersResponsePayload = {
      orgUsersList: orgUserItems,
      total: sortedUsers.length
    };

    return payload;
  }
}
