import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendSetProjectInfoRequestDto,
  ToBackendSetProjectInfoResponseDto
} from '#backend/controllers/projects/set-project-info/set-project-info.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetMemberCheckIsAdminError } from '#common/types/backend/function-errors/get-member-check-is-admin-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetProjectInfoOutput } from '#common/types/backend/routes/projects/set-project-info/set-project-info-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetProjectInfoController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private db: DbService
  ) {}

  @Post('api/ToBackendSetProjectInfo' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SetProjectInfo',
    description: "Update a project's info"
  })
  @ApiOkResponse({
    type: ToBackendSetProjectInfoResponseDto
  })
  async setProjectInfo(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSetProjectInfoRequestDto
  ): Promise<BackendResultForOperation<'setProjectInfo'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        name: body.input.name,
        userId: user.userId
      }),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.db.projects.findFirstCheckExists({
            where: eq(projectsTable.projectId, v.projectId)
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsAdminError> =>
          this.membersService.getMemberCheckIsAdmin({
            projectId: v.projectId,
            memberId: v.userId
          })
      ),
      Result.map(v => {
        if (isDefined(v.name)) {
          v.project.name = v.name;
        }
        return v;
      }),
      Result.andThrough(v =>
        this.db.write({ insertOrUpdate: { projects: [v.project] } })
      ),
      Result.map(
        (v): ToBackendSetProjectInfoOutput => ({
          project: this.projectsService.tabToApiProject({
            project: v.project,
            isAddPublicKey: v.userMember.isAdmin,
            isAddGitUrl: v.userMember.isAdmin
          })
        })
      )
    );
  }
}
