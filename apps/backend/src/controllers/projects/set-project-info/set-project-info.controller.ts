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
  ToBackendSetProjectInfoRequestDto,
  ToBackendSetProjectInfoResponseDto
} from '#backend/controllers/projects/set-project-info/set-project-info.dto';
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
import type { ToBackendSetProjectInfoOutput } from '#common/types/backend/routes/projects/set-project-info/set-project-info-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetProjectInfoController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
        userId: user.userId,
        projectsService: this.projectsService,
        membersService: this.membersService,
        db: this.db,
        cs: this.cs,
        logger: this.logger
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
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsAdminResultError> =>
          v.membersService.getMemberCheckIsAdminResult({
            projectId: v.projectId,
            memberId: v.userId
          })
      ),
      Result.inspect(v => {
        if (isDefined(v.name)) {
          v.project.name = v.name;
        }
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await v.db.drizzle.transaction(
                  async tx =>
                    await v.db.packer.write({
                      tx: tx,
                      insertOrUpdate: { projects: [v.project] }
                    })
                ),
              getRetryOption(v.cs, v.logger)
            );
          }
        })
      ),
      Result.map(
        (v): ToBackendSetProjectInfoOutput => ({
          project: v.projectsService.tabToApiProject({
            project: v.project,
            isAddPublicKey: v.userMember.isAdmin,
            isAddGitUrl: v.userMember.isAdmin
          })
        })
      )
    );
  }
}
