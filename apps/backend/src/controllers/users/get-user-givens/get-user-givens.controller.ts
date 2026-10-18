import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  ToBackendGetUserGivensRequestDto,
  ToBackendGetUserGivensResponseDto
} from '#backend/controllers/users/get-user-givens/get-user-givens.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { GivensService } from '#backend/services/db/givens/givens.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { UsersService } from '#backend/services/db/users/users.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetMemberGivensForSelectionError } from '#common/types/backend/function-errors/get-member-givens-for-selection-error';
import type { MemberGiven } from '#common/types/backend/parts/members/member-given';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetUserGivensOutput } from '#common/types/backend/routes/users/get-user-givens/get-user-givens-output';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetUserGivensController {
  constructor(
    private givensService: GivensService,
    private membersService: MembersService,
    private usersService: UsersService
  ) {}

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
      Result.bind(
        'member',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.membersService.getMemberCheckExists({
            memberId: v.user.userId,
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        this.usersService.selectUnselectedGivens({
          user: v.user,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'memberGivens',
        (
          v
        ): Result.ResultAsync<
          MemberGiven[],
          GetMemberGivensForSelectionError
        > =>
          this.givensService.getMemberGivensForSelection({
            projectId: v.projectId,
            roles: v.member.roles
          })
      ),
      Result.map(
        (v): ToBackendGetUserGivensOutput => ({
          user: this.usersService.tabToApi({ user: v.user }),
          memberGivens: v.memberGivens
        })
      )
    );
  }
}
