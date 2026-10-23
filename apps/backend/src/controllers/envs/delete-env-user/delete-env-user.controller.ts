import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendDeleteEnvUserRequestDto,
  ToBackendDeleteEnvUserResponseDto
} from '#backend/controllers/envs/delete-env-user/delete-env-user.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteEnvUserOutput } from '#common/types/backend/routes/envs/delete-env-user/delete-env-user-output';

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteEnvUserController {
  constructor(
    private membersService: MembersService,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteEnvUser' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteEnvUser',
    description: 'Revoke a team member access to an environment'
  })
  @ApiOkResponse({
    type: ToBackendDeleteEnvUserResponseDto
  })
  async deleteEnvUser(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteEnvUserRequestDto
  ): Promise<BackendResultForOperation<'deleteEnvUser'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        envId: body.input.envId,
        envUserId: body.input.envUserId,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.membersService.getMemberCheckIsEditorOrAdmin({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind('env', v =>
        getEnvCheckExistsAndAccess({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.map(v => {
        v.env.memberIds = v.env.memberIds.filter(
          memberId => memberId !== v.envUserId
        );
        return v;
      }),
      Result.andThrough(v =>
        this.db.write({ insertOrUpdate: { envs: [v.env] } })
      ),
      Result.bind('apiEnvs', v =>
        getApiEnvs({ db: this.db, projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendDeleteEnvUserOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          envs: v.apiEnvs
        })
      )
    );
  }
}
