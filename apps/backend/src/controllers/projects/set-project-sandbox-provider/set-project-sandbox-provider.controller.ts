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
  ToBackendSetProjectSandboxProviderRequestDto,
  ToBackendSetProjectSandboxProviderResponseDto
} from '#backend/controllers/projects/set-project-sandbox-provider/set-project-sandbox-provider.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetMemberCheckIsAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-admin-result-error';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetProjectSandboxProviderOutput } from '#common/types/backend/routes/projects/set-project-sandbox-provider/set-project-sandbox-provider-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetProjectSandboxProviderController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendSetProjectSandboxProvider' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SetProjectSandboxProvider',
    description: 'Update the sandbox provider API key on a project'
  })
  @ApiOkResponse({
    type: ToBackendSetProjectSandboxProviderResponseDto
  })
  async setProjectSandboxProvider(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSetProjectSandboxProviderRequestDto
  ): Promise<BackendResultForOperation<'setProjectSandboxProvider'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        e2bApiKey: body.input.e2bApiKey,
        userId: user.userId
      }),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsResultError> =>
          this.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsAdminResultError> =>
          this.membersService.getMemberCheckIsAdminResult({
            projectId: v.projectId,
            memberId: v.userId
          })
      ),
      Result.inspect(v => {
        if (isDefined(v.e2bApiKey)) {
          v.project.e2bApiKey = v.e2bApiKey === '' ? undefined : v.e2bApiKey;
        }
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: { projects: [v.project] }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.map(
        (v): ToBackendSetProjectSandboxProviderOutput => ({
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
