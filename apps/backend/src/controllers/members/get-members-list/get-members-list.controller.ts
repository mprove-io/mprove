import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  type ToBackendGetMembersListRequestDto,
  ToBackendGetMembersListResponseDto
} from '#backend/controllers/members/get-members-list/get-members-list.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { memberTabToApiEnvUser } from '#backend/functions/db/members/member-tab-to-api-env-user/member-tab-to-api-env-user';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetMembersListOutput } from '#common/types/backend/routes/members/get-members-list/get-members-list-output';

@ApiTags('Members')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetMembersListController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendGetMembersList' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetMembersList',
    description: 'Get the full list of project members'
  })
  @ApiOkResponse({
    type: ToBackendGetMembersListResponseDto
  })
  async getMembersList(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetMembersListRequestDto
  ): Promise<BackendResultForOperation<'getMembersList'>> {
    return Result.pipe(
      Result.succeed({ projectId: body.input.projectId, userId: user.userId }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.bind('members', v =>
        this.db.members.findMany({
          where: eq(membersTable.projectId, v.projectId)
        })
      ),
      Result.map(
        (v): ToBackendGetMembersListOutput => ({
          userMember: memberTabToApi({
            member: v.userMember
          }),
          membersList: v.members.map(member =>
            memberTabToApiEnvUser({ member: member })
          )
        })
      )
    );
  }
}
