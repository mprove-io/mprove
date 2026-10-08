import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteEnvUserRequestDto,
  ToBackendDeleteEnvUserResponseDto
} from '#backend/controllers/envs/delete-env-user/delete-env-user.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  EnvTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetApiEnvsResultError } from '#common/types/backend/function-errors/get-api-envs-result-error';
import type { GetEnvCheckExistsAndAccessResultError } from '#common/types/backend/function-errors/get-env-check-exists-and-access-result-error';
import type { GetMemberCheckIsEditorOrAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-result-error';
import type { Env } from '#common/types/backend/parts/env';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteEnvUserOutput } from '#common/types/backend/routes/envs/delete-env-user/delete-env-user-output';

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteEnvUserController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
        ...body.input,
        userId: user.userId,
        projectsService: this.projectsService,
        membersService: this.membersService,
        envsService: this.envsService,
        db: this.db,
        cs: this.cs,
        logger: this.logger
      }),
      Result.andThrough(v =>
        v.projectsService.getProjectCheckExistsResult({
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
          v.membersService.getMemberCheckIsEditorOrAdminResult({
            memberId: v.userId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'env',
        (
          v
        ): Result.ResultAsync<EnvTab, GetEnvCheckExistsAndAccessResultError> =>
          v.envsService.getEnvCheckExistsAndAccessResult({
            projectId: v.projectId,
            envId: v.envId,
            member: v.userMember
          })
      ),
      Result.inspect(v => {
        v.env.memberIds = v.env.memberIds.filter(
          memberId => memberId !== v.envUserId
        );
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await v.db.drizzle.transaction(async tx => {
                  await v.db.packer.write({
                    tx: tx,
                    insertOrUpdate: { envs: [v.env] }
                  });
                }),
              getRetryOption(v.cs, v.logger)
            );
          }
        })
      ),
      Result.bind(
        'apiEnvs',
        (v): Result.ResultAsync<Env[], GetApiEnvsResultError> =>
          v.envsService.getApiEnvsResult({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendDeleteEnvUserOutput => ({
          userMember: v.membersService.tabToApi({ member: v.userMember }),
          envs: v.apiEnvs
        })
      )
    );
  }
}
