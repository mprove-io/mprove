import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import {
  ToBackendGetGivensRequestDto,
  ToBackendGetGivensResponseDto
} from '#backend/controllers/givens/get-givens/get-givens.dto';
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
import type { GetApiGivensResultError } from '#common/types/backend/function-errors/get-api-givens-result-error';
import type { GetMemberCheckIsEditorOrAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-result-error';
import type { Given } from '#common/types/backend/parts/given/given';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetGivensOutput } from '#common/types/backend/routes/givens/get-givens/get-givens-output';

@ApiTags('Givens')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetGivensController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private givensService: GivensService
  ) {}

  @Post('api/ToBackendGetGivens' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetGivens',
    description: 'Get project givens'
  })
  @ApiOkResponse({
    type: ToBackendGetGivensResponseDto
  })
  async getGivens(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetGivensRequestDto
  ): Promise<BackendResultForOperation<'getGivens'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        user: user
      }),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (
          v
        ): Result.ResultAsync<
          MemberTab,
          GetMemberCheckIsEditorOrAdminResultError
        > =>
          this.membersService.getMemberCheckIsEditorOrAdminResult({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.bind(
        'apiGivens',
        (v): Result.ResultAsync<Given[], GetApiGivensResultError> =>
          this.givensService.getApiGivensResult({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendGetGivensOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          givens: v.apiGivens
        })
      )
    );
  }
}
