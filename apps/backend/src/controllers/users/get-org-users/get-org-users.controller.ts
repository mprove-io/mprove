import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, sql } from 'drizzle-orm';
import {
  type ToBackendGetOrgUsersRequestDto,
  ToBackendGetOrgUsersResponseDto
} from '#backend/controllers/users/get-org-users/get-org-users.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import {
  type AvatarEnt,
  avatarsTable
} from '#backend/drizzle/postgres/tables/avatars';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { orgsTable } from '#backend/drizzle/postgres/tables/orgs';
import type { ProjectTab } from '#backend/drizzle/postgres/tables/projects';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { usersTable } from '#backend/drizzle/postgres/tables/users';
import { checkUserIsOrgOwner } from '#backend/functions/db/orgs/check-user-is-org-owner/check-user-is-org-owner';
import { makeUserFullName } from '#backend/functions/db/users/make-user-full-name/make-user-full-name';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { OrgUsersItem } from '#common/types/backend/parts/org-users/org-users-item';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetOrgUsersOutput } from '#common/types/backend/routes/org-users/get-org-users/get-org-users-output';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetOrgUsersController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendGetOrgUsers' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetOrgUsers',
    description: 'Get a paginated list of users across org projects'
  })
  @ApiOkResponse({
    type: ToBackendGetOrgUsersResponseDto
  })
  async getOrgUsers(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetOrgUsersRequestDto
  ): Promise<BackendResultForOperation<'getOrgUsers'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        orgId: body.input.orgId,
        perPage: body.input.perPage,
        pageNum: body.input.pageNum
      }),
      Result.bind('org', v =>
        this.db.orgs.findFirstCheckExists({
          where: eq(orgsTable.orgId, v.orgId)
        })
      ),
      Result.andThrough(v =>
        checkUserIsOrgOwner({
          org: v.org,
          userId: v.user.userId
        })
      ),
      Result.bind('projects', v =>
        this.db.projects.findMany({
          where: eq(projectsTable.orgId, v.orgId)
        })
      ),
      Result.bind('projectIds', v =>
        Result.succeed(v.projects.map(project => project.projectId))
      ),
      Result.bind('memberParts', v =>
        this.db.drizzle
          .select({
            memberId: sql<string>`DISTINCT ${membersTable.memberId}`
          })
          .from(membersTable)
          .where(inArray(membersTable.projectId, v.projectIds))
          .then(xs => Result.succeed(xs))
      ),
      Result.bind('userIds', v =>
        Result.succeed(v.memberParts.map(memberPart => memberPart.memberId))
      ),
      Result.bind('sortedUsers', v =>
        this.db.users.findMany({
          where: and(inArray(usersTable.userId, v.userIds))
        })
      ),
      Result.map(v => {
        v.sortedUsers.sort((a, b) =>
          a.email > b.email ? 1 : b.email > a.email ? -1 : 0
        );

        return v;
      }),
      Result.bind('users', v => {
        let offset: number = (v.pageNum - 1) * v.perPage;

        return Result.succeed(v.sortedUsers.slice(offset, offset + v.perPage));
      }),
      Result.bind('members', async v =>
        v.userIds.length === 0
          ? Result.succeed([])
          : this.db.members.findMany({
              where: and(
                inArray(membersTable.memberId, v.userIds),
                inArray(membersTable.projectId, v.projectIds)
              )
            })
      ),
      Result.bind('avatars', async v =>
        v.userIds.length === 0
          ? Result.succeed([])
          : this.db.drizzle
              .select({
                keyTag: avatarsTable.keyTag,
                userId: avatarsTable.userId,
                st: avatarsTable.st
              })
              .from(avatarsTable)
              .where(inArray(avatarsTable.userId, v.userIds))
              .then(xs =>
                Result.sequence(xs, x =>
                  this.db.avatars.entToTab({
                    ent: x as AvatarEnt
                  })
                )
              )
      ),
      Result.map((v): ToBackendGetOrgUsersOutput => {
        let orgUserItems: OrgUsersItem[] = v.users.map(user => {
          let userMembers: MemberTab[] = v.members.filter(
            member => member.memberId === user.userId
          );

          return {
            userId: user.userId,
            avatarSmall: v.avatars.find(a => a.userId === user.userId)
              ?.avatarSmall,
            email: user.email,
            alias: user.alias,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: makeUserFullName({
              firstName: user.firstName,
              lastName: user.lastName
            }),
            adminProjects: userMembers
              .filter(member => member.isAdmin === true)
              .map(member => member.projectId)
              .map(projectId => {
                let project: ProjectTab = v.projects.find(
                  p => p.projectId === projectId
                );

                return project.name;
              }),
            editorProjects: userMembers
              .filter(member => member.isEditor === true)
              .map(member => member.projectId)
              .map(projectId => {
                let project: ProjectTab = v.projects.find(
                  p => p.projectId === projectId
                );

                return project.name;
              }),
            explorerProjects: userMembers
              .filter(member => member.isExplorer === true)
              .map(member => member.projectId)
              .map(projectId => {
                let project: ProjectTab = v.projects.find(
                  p => p.projectId === projectId
                );

                return project.name;
              }),
            projectUserProjects: userMembers
              .map(member => member.projectId)
              .map(projectId => {
                let project: ProjectTab = v.projects.find(
                  p => p.projectId === projectId
                );

                return project.name;
              })
          };
        });

        let payload: ToBackendGetOrgUsersOutput = {
          orgUsersList: orgUserItems,
          total: v.sortedUsers.length
        };

        return payload;
      })
    );
  }
}
