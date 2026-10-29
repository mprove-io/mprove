import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ToBackendGetProjectRequestDto,
  ToBackendGetProjectResponseDto
} from '#backend/controllers/projects/get-project/get-project.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { tabToApiProject } from '#backend/functions/db/projects/tab-to-api-project/tab-to-api-project';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetProjectOutput } from '#common/types/backend/routes/projects/get-project/get-project-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetProjectController {
  constructor(private db: DbService) {}

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
        userId: user.userId
      }),
      Result.bind('project', v =>
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
      Result.map(
        (v): ToBackendGetProjectOutput => ({
          project: tabToApiProject({
            project: v.project,
            isAddPublicKey: v.userMember.isAdmin === true,
            isAddGitUrl: v.userMember.isAdmin === true
          }),
          userMember: memberTabToApi({
            member: v.userMember
          })
        })
      )
    );
  }
}
