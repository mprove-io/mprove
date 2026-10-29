import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ToBackendGetUserGivensRequestDto,
  ToBackendGetUserGivensResponseDto
} from '#backend/controllers/users/get-user-givens/get-user-givens.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getMemberGivensForSelection } from '#backend/functions/db/givens/get-member-givens-for-selection/get-member-givens-for-selection';
import { selectUnselectedGivens } from '#backend/functions/db/users/select-unselected-givens/select-unselected-givens';
import { userTabToApi } from '#backend/functions/db/users/user-tab-to-api/user-tab-to-api';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetUserGivensOutput } from '#common/types/backend/routes/users/get-user-givens/get-user-givens-output';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetUserGivensController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendGetUserGivens' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetUserGivens',
    description:
      "Get the current user's normalized selected givens and effective member givens"
  })
  @ApiOkResponse({
    type: ToBackendGetUserGivensResponseDto
  })
  async getUserGivens(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetUserGivensRequestDto
  ): Promise<BackendResultForOperation<'getUserGivens'>> {
    return Result.pipe(
      Result.succeed({ user: user, projectId: body.input.projectId }),
      Result.bind('member', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.andThrough(v =>
        selectUnselectedGivens({
          user: v.user,
          projectId: v.projectId,
          db: this.db
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
        (v): ToBackendGetUserGivensOutput => ({
          user: userTabToApi({
            user: v.user
          }),
          memberGivens: v.memberGivens
        })
      )
    );
  }
}
