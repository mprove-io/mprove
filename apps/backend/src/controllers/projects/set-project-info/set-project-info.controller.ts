import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  type ToBackendSetProjectInfoRequestDto,
  ToBackendSetProjectInfoResponseDto
} from '#backend/controllers/projects/set-project-info/set-project-info.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { tabToApiProject } from '#backend/functions/db/projects/tab-to-api-project/tab-to-api-project';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetProjectInfoOutput } from '#common/types/backend/routes/projects/set-project-info/set-project-info-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetProjectInfoController {
  constructor(private db: DbService) {}

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
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        getMemberCheckIsAdmin({
          projectId: v.projectId,
          memberId: v.userId,
          db: this.db
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
          project: tabToApiProject({
            project: v.project,
            isAddPublicKey: v.userMember.isAdmin,
            isAddGitUrl: v.userMember.isAdmin
          })
        })
      )
    );
  }
}
