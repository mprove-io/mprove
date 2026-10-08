import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import {
  ToBackendGetProjectRequestDto,
  ToBackendGetProjectResponseDto
} from '#backend/controllers/projects/get-project/get-project.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetProjectOutput } from '#common/types/backend/routes/projects/get-project/get-project-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetProjectController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService
  ) {}

  @Post('api/ToBackendGetProject' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetProject',
    description: 'Get a project'
  })
  @ApiOkResponse({
    type: ToBackendGetProjectResponseDto
  })
  async getProject(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetProjectRequestDto
  ): Promise<BackendResultForOperation<'getProject'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        userId: user.userId,
        projectsService: this.projectsService,
        membersService: this.membersService
      }),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsResultError> =>
          v.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsResultError> =>
          v.membersService.getMemberCheckExistsResult({
            projectId: v.projectId,
            memberId: v.userId
          })
      ),
      Result.map(
        (v): ToBackendGetProjectOutput => ({
          project: v.projectsService.tabToApiProject({
            project: v.project,
            isAddPublicKey: v.userMember.isAdmin === true,
            isAddGitUrl: v.userMember.isAdmin === true
          }),
          userMember: v.membersService.tabToApi({ member: v.userMember })
        })
      )
    );
  }
}
