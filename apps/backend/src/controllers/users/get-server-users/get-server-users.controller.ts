import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
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
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  AvatarTab,
  OrgTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type AvatarEnt,
  avatarsTable
} from '#backend/drizzle/postgres/schema/avatars';
import type { MemberEnt } from '#backend/drizzle/postgres/schema/members';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { makeFullName } from '#backend/functions/make-full-name/make-full-name';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { AvatarEntToTabError } from '#common/types/backend/function-errors/avatar-ent-to-tab-error';
import type { OrgEntToTabError } from '#common/types/backend/function-errors/org-ent-to-tab-error';
import type { ProjectEntToTabError } from '#common/types/backend/function-errors/project-ent-to-tab-error';
import type { UserEntToTabError } from '#common/types/backend/function-errors/user-ent-to-tab-error';

import type { ServerUsersItem } from '#common/types/backend/parts/users/server-users-item';
import type { ServerUsersMembershipItem } from '#common/types/backend/parts/users/server-users-membership-item';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetServerUsersOutput } from '#common/types/backend/routes/users/get-server-users/get-server-users-output';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetServerUsersController {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
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
      Result.bind(
        'total',
        (v): Result.ResultAsync<number, never> =>
          this.db.drizzle
            .select({ total: count() })
            .from(usersTable)
            .then(xs => Result.succeed(xs[0].total))
      ),
      Result.bind(
        'offset',
        (v): Result.Result<number, never> =>
          Result.succeed((v.pageNum - 1) * v.perPage)
      ),
      Result.bind(
        'users',
        (v): Result.ResultAsync<UserTab[], UserEntToTabError> =>
          this.db.drizzle
            .select()
            .from(usersTable)
            .orderBy(sql`${usersTable.createdTs} DESC NULLS LAST`)
            .limit(v.perPage)
            .offset(v.offset)
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.userEntToTabResult({ userEnt: x })
              )
            )
      ),
      Result.bind(
        'userIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.users.map(user => user.userId))
      ),
      Result.bind(
        'memberEnts',
        async (v): Result.ResultAsync<MemberEnt[], never> =>
          v.userIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.membersTable
                .findMany({
                  where: inArray(membersTable.memberId, v.userIds)
                })
                .then(xs => Result.succeed(xs))
      ),
      Result.bind(
        'projectIds',
        (v): Result.Result<string[], never> =>
          Result.succeed([
            ...new Set(v.memberEnts.map(memberEnt => memberEnt.projectId))
          ])
      ),
      Result.bind(
        'projects',
        async (v): Result.ResultAsync<ProjectTab[], ProjectEntToTabError> =>
          v.projectIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.projectsTable
                .findMany({
                  where: inArray(projectsTable.projectId, v.projectIds)
                })
                .then(xs =>
                  Result.sequence(xs, x =>
                    this.tabService.projectEntToTabResult({ projectEnt: x })
                  )
                )
      ),
      Result.bind(
        'orgIds',
        (v): Result.Result<string[], never> =>
          Result.succeed([...new Set(v.projects.map(project => project.orgId))])
      ),
      Result.bind(
        'orgs',
        async (v): Result.ResultAsync<OrgTab[], OrgEntToTabError> =>
          v.orgIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.orgsTable
                .findMany({
                  where: inArray(orgsTable.orgId, v.orgIds)
                })
                .then(xs =>
                  Result.sequence(xs, x =>
                    this.tabService.orgEntToTabResult({ orgEnt: x })
                  )
                )
      ),
      Result.bind(
        'avatars',
        async (v): Result.ResultAsync<AvatarTab[], AvatarEntToTabError> =>
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
                    this.tabService.avatarEntToTabResult({
                      avatarEnt: x as AvatarEnt
                    })
                  )
                )
      ),
      Result.map((v): ToBackendGetServerUsersOutput => {
        let serverUserItems: ServerUsersItem[] = v.users.map(user => {
          let userMemberEnts: MemberEnt[] = v.memberEnts.filter(
            memberEnt => memberEnt.memberId === user.userId
          );

          let memberships: ServerUsersMembershipItem[] = userMemberEnts.map(
            memberEnt => {
              let project: ProjectTab = v.projects.find(
                p => p.projectId === memberEnt.projectId
              );

              let org: OrgTab = v.orgs.find(o => o.orgId === project?.orgId);

              return {
                orgId: project?.orgId,
                isOrgOwner: org?.ownerId === user.userId,
                projectId: memberEnt.projectId,
                isAdmin: memberEnt.isAdmin === true,
                isFileEditor: memberEnt.isEditor === true,
                isExplorer: memberEnt.isExplorer === true
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
            fullName: makeFullName({
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
