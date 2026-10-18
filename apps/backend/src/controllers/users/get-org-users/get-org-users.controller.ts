import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, sql } from 'drizzle-orm';
import {
  ToBackendGetOrgUsersRequestDto,
  ToBackendGetOrgUsersResponseDto
} from '#backend/controllers/users/get-org-users/get-org-users.dto';
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
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { makeFullName } from '#backend/functions/make-full-name/make-full-name';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { AvatarEntToTabError } from '#common/types/backend/function-errors/avatar-ent-to-tab-error';
import type { GetOrgCheckExistsError } from '#common/types/backend/function-errors/get-org-check-exists-error';
import type { ProjectEntToTabError } from '#common/types/backend/function-errors/project-ent-to-tab-error';
import type { UserEntToTabError } from '#common/types/backend/function-errors/user-ent-to-tab-error';
import type { OrgUsersItem } from '#common/types/backend/parts/org-users/org-users-item';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetOrgUsersOutput } from '#common/types/backend/routes/org-users/get-org-users/get-org-users-output';

type MemberPart = { memberId: string };

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetOrgUsersController {
  constructor(
    private tabService: TabService,
    private orgsService: OrgsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

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
      Result.bind(
        'org',
        (v): Result.ResultAsync<OrgTab, GetOrgCheckExistsError> =>
          this.orgsService.getOrgCheckExists({ orgId: v.orgId })
      ),
      Result.andThrough(v =>
        this.orgsService.checkUserIsOrgOwner({
          org: v.org,
          userId: v.user.userId
        })
      ),
      Result.bind(
        'projects',
        (v): Result.ResultAsync<ProjectTab[], ProjectEntToTabError> =>
          this.db.drizzle.query.projectsTable
            .findMany({ where: eq(projectsTable.orgId, v.orgId) })
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.projectEntToTab({ projectEnt: x })
              )
            )
      ),
      Result.bind(
        'projectIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.projects.map(project => project.projectId))
      ),
      Result.bind(
        'memberParts',
        (v): Result.ResultAsync<MemberPart[], never> =>
          this.db.drizzle
            .select({
              memberId: sql<string>`DISTINCT ${membersTable.memberId}`
            })
            .from(membersTable)
            .where(inArray(membersTable.projectId, v.projectIds))
            .then(xs => Result.succeed(xs))
      ),
      Result.bind(
        'userIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.memberParts.map(memberPart => memberPart.memberId))
      ),
      Result.bind(
        'sortedUsers',
        (v): Result.ResultAsync<UserTab[], UserEntToTabError> =>
          this.db.drizzle.query.usersTable
            .findMany({ where: and(inArray(usersTable.userId, v.userIds)) })
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.userEntToTab({ userEnt: x })
              )
            )
      ),
      Result.map(v => {
        v.sortedUsers.sort((a, b) =>
          a.email > b.email ? 1 : b.email > a.email ? -1 : 0
        );

        return v;
      }),
      Result.bind('users', (v): Result.Result<UserTab[], never> => {
        let offset: number = (v.pageNum - 1) * v.perPage;

        return Result.succeed(v.sortedUsers.slice(offset, offset + v.perPage));
      }),
      Result.bind(
        'memberEnts',
        async (v): Result.ResultAsync<MemberEnt[], never> =>
          v.userIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.membersTable
                .findMany({
                  where: and(
                    inArray(membersTable.memberId, v.userIds),
                    inArray(membersTable.projectId, v.projectIds)
                  )
                })
                .then(xs => Result.succeed(xs))
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
                    this.tabService.avatarEntToTab({
                      avatarEnt: x as AvatarEnt
                    })
                  )
                )
      ),
      Result.map((v): ToBackendGetOrgUsersOutput => {
        let orgUserItems: OrgUsersItem[] = v.users.map(user => {
          let userMemberEnts: MemberEnt[] = v.memberEnts.filter(
            memberEnt => memberEnt.memberId === user.userId
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
            adminProjects: userMemberEnts
              .filter(memberEnt => memberEnt.isAdmin === true)
              .map(memberEnt => memberEnt.projectId)
              .map(projectId => {
                let project: ProjectTab = v.projects.find(
                  p => p.projectId === projectId
                );

                return project.name;
              }),
            editorProjects: userMemberEnts
              .filter(memberEnt => memberEnt.isEditor === true)
              .map(memberEnt => memberEnt.projectId)
              .map(projectId => {
                let project: ProjectTab = v.projects.find(
                  p => p.projectId === projectId
                );

                return project.name;
              }),
            explorerProjects: userMemberEnts
              .filter(memberEnt => memberEnt.isExplorer === true)
              .map(memberEnt => memberEnt.projectId)
              .map(projectId => {
                let project: ProjectTab = v.projects.find(
                  p => p.projectId === projectId
                );

                return project.name;
              }),
            projectUserProjects: userMemberEnts
              .map(memberEnt => memberEnt.projectId)
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
