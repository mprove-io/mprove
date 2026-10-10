import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendGetMembersRequestDto,
  ToBackendGetMembersResponseDto
} from '#backend/controllers/members/get-members/get-members.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
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
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { AvatarEntToTabResultError } from '#common/types/backend/function-errors/avatar-ent-to-tab-result-error';
import type { GetApiRolesResultError } from '#common/types/backend/function-errors/get-api-roles-result-error';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { MemberEntToTabResultError } from '#common/types/backend/function-errors/member-ent-to-tab-result-error';
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
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
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
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsResultError> =>
          this.membersService.getMemberCheckExistsResult({
            memberId: v.userId,
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        this.projectsService.checkProjectIsNotRestrictedResult({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: undefined
        })
      ),
      Result.bind(
        'projectMembers',
        (v): Result.ResultAsync<MemberTab[], MemberEntToTabResultError> =>
          this.db.drizzle.query.membersTable
            .findMany({ where: and(eq(membersTable.projectId, v.projectId)) })
            .then(memberEnts =>
              Result.sequence(memberEnts, memberEnt =>
                this.tabService.memberEntToTabResult({ memberEnt: memberEnt })
              )
            )
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
        async (
          v
        ): Result.ResultAsync<AvatarTab[], AvatarEntToTabResultError> =>
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
                .then(avatarEnts =>
                  Result.sequence(avatarEnts, avatarEnt =>
                    this.tabService.avatarEntToTabResult({
                      avatarEnt: avatarEnt as AvatarEnt
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
        (v): Result.ResultAsync<Role[], GetApiRolesResultError> =>
          this.rolesService.getApiRolesResult({ projectId: v.projectId })
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
