import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { count, inArray, sql } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendGetServerUsersRequestDto,
  ToBackendGetServerUsersResponseDto
} from '#backend/controllers/users/get-server-users/get-server-users.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import {
  type AvatarEnt,
  avatarsTable
} from '#backend/drizzle/postgres/tables/avatars';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import type { OrgTab } from '#backend/drizzle/postgres/tables/orgs';
import { orgsTable } from '#backend/drizzle/postgres/tables/orgs';
import type { ProjectTab } from '#backend/drizzle/postgres/tables/projects';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { usersTable } from '#backend/drizzle/postgres/tables/users';
import { makeUserFullName } from '#backend/functions/db/users/make-user-full-name/make-user-full-name';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ServerUsersItem } from '#common/types/backend/parts/users/server-users-item';
import type { ServerUsersMembershipItem } from '#common/types/backend/parts/users/server-users-membership-item';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetServerUsersOutput } from '#common/types/backend/routes/users/get-server-users/get-server-users-output';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetServerUsersController {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetServerUsers' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'getServerUsers'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        perPage: body.input.perPage,
        pageNum: body.input.pageNum
      }),
      Result.andThrough(v => {
        let mproveAdminEmail: string =
          this.cs.get<BackendConfig['mproveAdminEmail']>('mproveAdminEmail');

        return v.user.email !== mproveAdminEmail
          ? Result.fail({ code: 'BACKEND_USER_IS_NOT_SERVER_ADMIN' })
          : Result.succeed();
      }),
      Result.bind('total', v =>
        this.db.drizzle
          .select({ total: count() })
          .from(usersTable)
          .then(xs => Result.succeed(xs[0].total))
      ),
      Result.bind('offset', v => Result.succeed((v.pageNum - 1) * v.perPage)),
      Result.bind('users', v =>
        this.db.drizzle
          .select()
          .from(usersTable)
          .orderBy(sql`${usersTable.createdTs} DESC NULLS LAST`)
          .limit(v.perPage)
          .offset(v.offset)
          .then(xs =>
            Result.sequence(xs, x => this.db.users.entToTab({ ent: x }))
          )
      ),
      Result.bind('userIds', v =>
        Result.succeed(v.users.map(user => user.userId))
      ),
      Result.bind('members', async v =>
        v.userIds.length === 0
          ? Result.succeed([])
          : this.db.members.findMany({
              where: inArray(membersTable.memberId, v.userIds)
            })
      ),
      Result.bind('projectIds', v =>
        Result.succeed<string[]>([
          ...new Set(v.members.map(member => member.projectId))
        ])
      ),
      Result.bind('projects', async v =>
        v.projectIds.length === 0
          ? Result.succeed([])
          : this.db.projects.findMany({
              where: inArray(projectsTable.projectId, v.projectIds)
            })
      ),
      Result.bind('orgIds', v =>
        Result.succeed<string[]>([
          ...new Set(v.projects.map(project => project.orgId))
        ])
      ),
      Result.bind('orgs', async v =>
        v.orgIds.length === 0
          ? Result.succeed([])
          : this.db.orgs.findMany({
              where: inArray(orgsTable.orgId, v.orgIds)
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
      Result.map((v): ToBackendGetServerUsersOutput => {
        let serverUserItems: ServerUsersItem[] = v.users.map(user => {
          let userMembers: MemberTab[] = v.members.filter(
            member => member.memberId === user.userId
          );

          let memberships: ServerUsersMembershipItem[] = userMembers.map(
            member => {
              let project: ProjectTab = v.projects.find(
                p => p.projectId === member.projectId
              );

              let org: OrgTab = v.orgs.find(o => o.orgId === project?.orgId);

              return {
                orgId: project?.orgId,
                isOrgOwner: org?.ownerId === user.userId,
                projectId: member.projectId,
                isAdmin: member.isAdmin === true,
                isFileEditor: member.isEditor === true,
                isExplorer: member.isExplorer === true
              };
            }
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
            createdTs: user.createdTs,
            memberships: memberships
          };
        });

        let payload: ToBackendGetServerUsersOutput = {
          serverUsersList: serverUserItems,
          total: v.total
        };

        return payload;
      })
    );
  }
}
