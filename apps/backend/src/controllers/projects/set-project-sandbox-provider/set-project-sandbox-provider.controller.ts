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
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSetProjectSandboxProviderRequestDto,
  ToBackendSetProjectSandboxProviderResponseDto
} from '#backend/controllers/projects/set-project-sandbox-provider/set-project-sandbox-provider.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendSetProjectSandboxProviderOutput } from '#common/types/backend/routes/projects/set-project-sandbox-provider/set-project-sandbox-provider-output';
import type { ToBackendRoute } from '#common/types/to-backend-route';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetProjectSandboxProviderController {
  constructor(
    private tabService: TabService,
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
  ) {
    let { projectId, e2bApiKey } = body.input;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsAdmin({
      projectId: projectId,
      memberId: user.userId
    });

    if (isDefined(e2bApiKey)) {
      project.e2bApiKey = e2bApiKey === '' ? undefined : e2bApiKey;
    }

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                projects: [project]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendSetProjectSandboxProviderOutput = {
      project: this.projectsService.tabToApiProject({
        project: project,
        isAddPublicKey: userMember.isAdmin,
        isAddGitUrl: userMember.isAdmin
      })
    };

    return payload;
  }
}
