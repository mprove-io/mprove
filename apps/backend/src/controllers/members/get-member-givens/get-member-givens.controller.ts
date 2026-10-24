import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ToBackendGetMemberGivensRequestDto,
  ToBackendGetMemberGivensResponseDto
} from '#backend/controllers/members/get-member-givens/get-member-givens.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { getMemberGivensForSelection } from '#backend/functions/db/givens/get-member-givens-for-selection/get-member-givens-for-selection';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetMemberGivensOutput } from '#common/types/backend/routes/members/get-member-givens/get-member-givens-output';

@ApiTags('Members')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetMemberGivensController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendGetMemberGivens' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetMemberGivens',
    description: 'Get effective given values available to a project member'
  })
  @ApiOkResponse({
    type: ToBackendGetMemberGivensResponseDto
  })
  async getMemberGivens(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetMemberGivensRequestDto
  ): Promise<BackendResultForOperation<'getMemberGivens'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        memberId: body.input.memberId,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.userId),
            eq(membersTable.projectId, v.projectId)
          )
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
      Result.bind('memberGivens', v =>
        getMemberGivensForSelection({
          db: this.db,
          projectId: v.projectId,
          roles: v.member.roles
        })
      ),
      Result.map(
        (v): ToBackendGetMemberGivensOutput => ({
          memberGivens: v.memberGivens
        })
      )
    );
  }
}
