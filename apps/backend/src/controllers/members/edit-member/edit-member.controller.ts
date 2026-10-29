import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ToBackendEditMemberRequestDto,
  ToBackendEditMemberResponseDto
} from '#backend/controllers/members/edit-member/edit-member.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { AvatarTab } from '#backend/drizzle/postgres/tables/avatars';
import {
  type AvatarEnt,
  avatarsTable
} from '#backend/drizzle/postgres/tables/avatars';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { checkRolesExist } from '#backend/functions/db/roles/check-roles-exist/check-roles-exist';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Member } from '#common/types/backend/parts/member';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditMemberOutput } from '#common/types/backend/routes/members/edit-member/edit-member-output';

@ApiTags('Members')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditMemberController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendEditMember' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'EditMember',
    description: "Update a member's roles"
  })
  @ApiOkResponse({
    type: ToBackendEditMemberResponseDto
  })
  async editMember(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditMemberRequestDto
  ): Promise<BackendResultForOperation<'editMember'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        memberId: body.input.memberId,
        isAdmin: body.input.isAdmin,
        isEditor: body.input.isEditor,
        isExplorer: body.input.isExplorer,
        roles: body.input.roles,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        v.memberId === v.userId && v.isAdmin === false
          ? Result.fail({
              code: 'BACKEND_ADMIN_CANNOT_CHANGE_HIS_ADMIN_STATUS'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        checkRolesExist({
          projectId: v.projectId,
          roleIds: v.roles,
          db: this.db
        })
      ),
      Result.bind('member', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.memberId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.map(v => {
        v.member.isAdmin = v.isAdmin;
        v.member.isEditor = v.isEditor;
        v.member.isExplorer = v.isExplorer;
        v.member.roles = v.roles;

        return v;
      }),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: {
            members: [v.member]
          }
        })
      ),
      Result.bind('avatars', v =>
        this.db.drizzle
          .select({
            keyTag: avatarsTable.keyTag,
            userId: avatarsTable.userId,
            st: avatarsTable.st
            // lt: {},
          })
          .from(avatarsTable)
          .where(eq(avatarsTable.userId, v.member.memberId))
          .then(xs =>
            Result.sequence(xs, x =>
              this.db.avatars.entToTab({
                ent: x as AvatarEnt
              })
            )
          )
      ),
      Result.bind('apiMember', v => {
        let avatar: AvatarTab = v.avatars.length > 0 ? v.avatars[0] : undefined;

        let apiMember: Member = memberTabToApi({
          member: v.member
        });

        if (isDefined(avatar)) {
          apiMember.avatarSmall = avatar.avatarSmall;
        }

        return Result.succeed(apiMember);
      }),
      Result.map((v): ToBackendEditMemberOutput => ({ member: v.apiMember }))
    );
  }
}
