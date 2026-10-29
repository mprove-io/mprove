import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendGetMembersRequestDto,
  ToBackendGetMembersResponseDto
} from '#backend/controllers/members/get-members/get-members.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { AvatarTab } from '#backend/drizzle/postgres/tables/avatars';
import {
  type AvatarEnt,
  avatarsTable
} from '#backend/drizzle/postgres/tables/avatars';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { checkProjectIsNotRestricted } from '#backend/functions/db/projects/check-project-is-not-restricted/check-project-is-not-restricted';
import { getApiRoles } from '#backend/functions/db/roles/get-api-roles/get-api-roles';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetMembersOutput } from '#common/types/backend/routes/members/get-members/get-members-output';

@ApiTags('Members')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetMembersController {
  constructor(
    private db: DbService,
    private cs: ConfigService<BackendConfig>
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
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.andThrough(v =>
        checkProjectIsNotRestricted({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: undefined,
          cs: this.cs
        })
      ),
      Result.bind('projectMembers', v =>
        this.db.members.findMany({
          where: and(eq(membersTable.projectId, v.projectId))
        })
      ),
      Result.bind('sortedMembers', v =>
        Result.succeed(
          v.projectMembers.sort((a, b) =>
            a.email > b.email ? 1 : b.email > a.email ? -1 : 0
          )
        )
      ),
      Result.bind('members', v => {
        let offset = (v.pageNum - 1) * v.perPage;

        return Result.succeed(
          v.sortedMembers.slice(offset, offset + v.perPage)
        );
      }),
      Result.bind('memberIds', v =>
        Result.succeed(v.members.map(member => member.memberId))
      ),
      Result.bind('avatars', async v =>
        v.memberIds.length === 0
          ? Result.succeed<AvatarTab[]>([])
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
                  this.db.avatars.entToTab({
                    ent: x as AvatarEnt
                  })
                )
              )
      ),
      Result.bind('apiUserMember', v =>
        Result.succeed(
          memberTabToApi({
            member: v.userMember
          })
        )
      ),
      Result.bind('apiMembers', v =>
        Result.succeed(
          v.members.map(member =>
            memberTabToApi({
              member: member
            })
          )
        )
      ),
      Result.bind('apiRoles', v =>
        getApiRoles({
          projectId: v.projectId,
          db: this.db
        })
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
