import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import {
  ToBackendGetMemberGivensRequestDto,
  ToBackendGetMemberGivensResponseDto
} from '#backend/controllers/members/get-member-givens/get-member-givens.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { GivensService } from '#backend/services/db/givens/givens.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { GetMemberGivensForSelectionResultError } from '#common/types/backend/function-errors/get-member-givens-for-selection-result-error';
import type { MemberGiven } from '#common/types/backend/parts/members/member-given';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetMemberGivensOutput } from '#common/types/backend/routes/members/get-member-givens/get-member-givens-output';

@ApiTags('Members')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetMemberGivensController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private givensService: GivensService
  ) {}

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
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckExistsResult({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'member',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsResultError> =>
          this.membersService.getMemberCheckExistsResult({
            memberId: v.memberId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'memberGivens',
        (
          v
        ): Result.ResultAsync<
          MemberGiven[],
          GetMemberGivensForSelectionResultError
        > =>
          this.givensService.getMemberGivensForSelectionResult({
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
