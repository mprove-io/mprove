import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { makeFullName } from '~backend/functions/make-full-name';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  OrgUsersItem,
  ToBackendGetOrgUsersRequest,
  ToBackendGetOrgUsersResponsePayload
} from '~common/interfaces/to-backend/org-users/to-backend-get-org-users';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetOrgUsersController {
  constructor(
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

    let projects = await this.db.drizzle.query.projectsTable.findMany({
      where: eq(projectsTable.orgId, orgId)
    });

    let projectIds = projects.map(x => x.projectId);

    let memberParts = await this.db.drizzle
      .select({
        memberId: sql<string>`DISTINCT ${membersTable.memberId}`
      })
      .from(membersTable)
      .where(inArray(membersTable.projectId, projectIds));

    let userIds = memberParts.map(x => x.memberId);

    let usersResult = await this.db.drizzle
      .select({
        record: usersTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(usersTable)
      .where(inArray(usersTable.userId, userIds))
      .orderBy(asc(usersTable.email))
      .limit(perPage)
      .offset((pageNum - 1) * perPage);

    let users = usersResult.map(x => x.record);

    let members =
      userIds.length === 0
        ? []
        : await this.db.drizzle.query.membersTable.findMany({
            where: and(
              inArray(membersTable.memberId, userIds),
              inArray(membersTable.projectId, projectIds)
            )
          });

    let orgUsers: OrgUsersItem[] = [];

    let avatars =
      userIds.length === 0
        ? []
        : await this.db.drizzle
            .select({
              userId: avatarsTable.userId,
              avatarSmall: avatarsTable.avatarSmall
            })
            .from(avatarsTable)
            .where(inArray(avatarsTable.userId, userIds));

    users.forEach(x => {
      let userMembers = members.filter(m => m.memberId === x.userId);

      let orgUser: OrgUsersItem = {
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

      orgUsers.push(orgUser);
    });

    let payload: ToBackendGetOrgUsersResponsePayload = {
      orgUsersList: orgUsers,
      total: usersResult.length > 0 ? usersResult[0].total : 0
    };

    return payload;
  }
}
