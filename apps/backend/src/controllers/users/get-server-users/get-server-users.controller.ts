import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { count, inArray, sql } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendGetServerUsersRequestDto,
  ToBackendGetServerUsersResponseDto
} from '#backend/controllers/users/get-server-users/get-server-users.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type AvatarEnt,
  avatarsTable
} from '#backend/drizzle/postgres/schema/avatars';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { makeFullName } from '#backend/functions/make-full-name';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { TabService } from '#backend/services/tab.service';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ServerError } from '#common/models/server-error';
import type {
  ServerUsersItem,
  ServerUsersMembershipItem,
  ToBackendGetServerUsersResponsePayload
} from '#common/zod/to-backend/users/to-backend-get-server-users';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetServerUsersController {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetServerUsers)
  @ApiOperation({
    summary: 'GetServerUsers',
    description: 'Get a paginated list of all users across all organizations'
  })
  @ApiOkResponse({
    type: ToBackendGetServerUsersResponseDto
  })
  async getServerUsers(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetServerUsersRequestDto
  ) {
    let { pageNum, perPage } = body.payload;

    let mproveAdminEmail =
      this.cs.get<BackendConfig['mproveAdminEmail']>('mproveAdminEmail');

    if (user.email !== mproveAdminEmail) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_IS_NOT_SERVER_ADMIN
      });
    }

    let [{ total }] = await this.db.drizzle
      .select({ total: count() })
      .from(usersTable);

    let offset = (pageNum - 1) * perPage;

    let users = await this.db.drizzle
      .select()
      .from(usersTable)
      .orderBy(sql`${usersTable.createdTs} DESC NULLS LAST`)
      .limit(perPage)
      .offset(offset)
      .then(xs => xs.map(x => this.tabService.userEntToTab(x)));

    let userIds = users.map(x => x.userId);

    let members =
      userIds.length === 0
        ? []
        : await this.db.drizzle.query.membersTable.findMany({
            where: inArray(membersTable.memberId, userIds)
          });

    let projectIds = [...new Set(members.map(x => x.projectId))];

    let projects =
      projectIds.length === 0
        ? []
        : await this.db.drizzle.query.projectsTable
            .findMany({
              where: inArray(projectsTable.projectId, projectIds)
            })
            .then(xs => xs.map(x => this.tabService.projectEntToTab(x)));

    let orgIds = [...new Set(projects.map(x => x.orgId))];

    let orgs =
      orgIds.length === 0
        ? []
        : await this.db.drizzle.query.orgsTable
            .findMany({
              where: inArray(orgsTable.orgId, orgIds)
            })
            .then(xs => xs.map(x => this.tabService.orgEntToTab(x)));

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

    let serverUserItems: ServerUsersItem[] = [];

    users.forEach(x => {
      let userMembers = members.filter(m => m.memberId === x.userId);

      let memberships: ServerUsersMembershipItem[] = userMembers.map(m => {
        let project = projects.find(p => p.projectId === m.projectId);
        let org = orgs.find(o => o.orgId === project?.orgId);

        return {
          orgId: project?.orgId,
          isOrgOwner: org?.ownerId === x.userId,
          projectId: m.projectId,
          isAdmin: m.isAdmin === true,
          isFileEditor: m.isEditor === true,
          isExplorer: m.isExplorer === true
        };
      });

      let serverUsersItem: ServerUsersItem = {
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
        createdTs: x.createdTs,
        memberships: memberships
      };

      serverUserItems.push(serverUsersItem);
    });

    let payload: ToBackendGetServerUsersResponsePayload = {
      serverUsersList: serverUserItems,
      total: total
    };

    return payload;
  }
}
