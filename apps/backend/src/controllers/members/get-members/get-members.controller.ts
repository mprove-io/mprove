import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetMembersRequestDto,
  ToBackendGetMembersResponseDto
} from '#backend/controllers/members/get-members/get-members.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  AvatarTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type AvatarEnt,
  avatarsTable
} from '#backend/drizzle/postgres/schema/avatars';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { AvatarEntToTabError } from '#common/types/backend/function-errors/avatar-ent-to-tab-error';
import type { DbMembersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';
import type { DbMembersFindManyError } from '#common/types/backend/function-errors/db/members/db-members-find-many-error';
import type { GetApiRolesError } from '#common/types/backend/function-errors/get-api-roles-error';
import type { Member } from '#common/types/backend/parts/member';
import type { Role } from '#common/types/backend/parts/role';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetMembersOutput } from '#common/types/backend/routes/members/get-members/get-members-output';

@ApiTags('Members')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetMembersController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rolesService: RolesService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetMembers' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetMembers',
    description: 'Get a paginated list of project members'
  })
  @ApiOkResponse({
    type: ToBackendGetMembersResponseDto
  })
  async getMembers(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetMembersRequestDto
  ): Promise<BackendResultForOperation<'getMembers'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        perPage: body.input.perPage,
        pageNum: body.input.pageNum,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind(
        'userMember',
        (
          v
        ): Result.ResultAsync<MemberTab, DbMembersFindFirstCheckExistsError> =>
          this.db.members.findFirstCheckExists({
            where: and(
              eq(membersTable.memberId, v.userId),
              eq(membersTable.projectId, v.projectId)
            )
          })
      ),
      Result.andThrough(v =>
        this.projectsService.checkProjectIsNotRestricted({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: undefined
        })
      ),
      Result.bind(
        'projectMembers',
        (v): Result.ResultAsync<MemberTab[], DbMembersFindManyError> =>
          this.db.members.findMany({
            where: and(eq(membersTable.projectId, v.projectId))
          })
      ),
      Result.bind(
        'sortedMembers',
        (v): Result.Result<MemberTab[], never> =>
          Result.succeed(
            v.projectMembers.sort((a, b) =>
              a.email > b.email ? 1 : b.email > a.email ? -1 : 0
            )
          )
      ),
      Result.bind('members', (v): Result.Result<MemberTab[], never> => {
        let offset = (v.pageNum - 1) * v.perPage;

        return Result.succeed(
          v.sortedMembers.slice(offset, offset + v.perPage)
        );
      }),
      Result.bind(
        'memberIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.members.map(member => member.memberId))
      ),
      Result.bind(
        'avatars',
        async (v): Result.ResultAsync<AvatarTab[], AvatarEntToTabError> =>
          v.memberIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle
                .select({
                  keyTag: avatarsTable.keyTag,
                  userId: avatarsTable.userId,
                  st: avatarsTable.st
                })
                .from(avatarsTable)
                .where(inArray(avatarsTable.userId, v.memberIds))
                .then(xs =>
                  Result.sequence(xs, x =>
                    this.tabService.avatarEntToTab({
                      avatarEnt: x as AvatarEnt
                    })
                  )
                )
      ),
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind(
        'apiMembers',
        (v): Result.Result<Member[], never> =>
          Result.succeed(
            v.members.map(member =>
              this.membersService.tabToApi({ member: member })
            )
          )
      ),
      Result.bind(
        'apiRoles',
        (v): Result.ResultAsync<Role[], GetApiRolesError> =>
          this.rolesService.getApiRoles({ projectId: v.projectId })
      ),
      Result.map(v => {
        v.apiMembers.forEach(apiMember => {
          let avatar: AvatarTab = v.avatars.find(
            avatar => avatar.userId === apiMember.memberId
          );

          if (isDefined(avatar)) {
            apiMember.avatarSmall = avatar.avatarSmall;
          }
        });
        return v;
      }),
      Result.map(
        (v): ToBackendGetMembersOutput => ({
          userMember: v.apiUserMember,
          members: v.apiMembers,
          roles: v.apiRoles,
          total: v.sortedMembers.length
        })
      )
    );
  }
}
