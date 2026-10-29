import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendCreateEnvUserRequestDto,
  ToBackendCreateEnvUserResponseDto
} from '#backend/controllers/envs/create-env-user/create-env-user.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { getMemberCheckIsEditorOrAdmin } from '#backend/functions/db/members/get-member-check-is-editor-or-admin/get-member-check-is-editor-or-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { checkProjectIsNotRestricted } from '#backend/functions/db/projects/check-project-is-not-restricted/check-project-is-not-restricted';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateEnvUserOutput } from '#common/types/backend/routes/envs/create-env-user/create-env-user-output';

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateEnvUserController {
  constructor(
    private db: DbService,
    private cs: ConfigService<BackendConfig>
  ) {}

  @Post('api/ToBackendCreateEnvUser' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateEnvUser',
    description: 'Grant a team member access to an environment'
  })
  @ApiOkResponse({
    type: ToBackendCreateEnvUserResponseDto
  })
  async createEnvUser(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateEnvUserRequestDto
  ): Promise<BackendResultForOperation<'createEnvUser'>> {
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
        getMemberCheckIsEditorOrAdmin({
          memberId: v.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        checkProjectIsNotRestricted({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: undefined,
          cs: this.cs
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
      Result.andThrough(v =>
        v.env.memberIds.includes(v.envUserId)
          ? Result.fail({ code: 'BACKEND_ENV_USER_ALREADY_EXISTS' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.envUserId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.map(v => {
        v.env.memberIds.push(v.envUserId);
        return v;
      }),
      Result.andThrough(v =>
        this.db.write({ insertOrUpdate: { envs: [v.env] } })
      ),
      Result.bind('apiEnvs', v =>
        getApiEnvs({ db: this.db, projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendCreateEnvUserOutput => ({
          userMember: memberTabToApi({
            member: v.userMember
          }),
          envs: v.apiEnvs
        })
      )
    );
  }
}
